import { OperationDefinitionNode, parse, SelectionNode } from 'graphql';
import { NextRequest } from 'next/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';

const QUERY_WHITELIST = [
  {
    name: 'Site',
    type: 'query',
    allowedFields: {
      site: {
        paymentWallets: true, // allow any subfields of paymentWallets
      },
    },
  },
];

export const POST = async (request: NextRequest) => {
  const body: unknown = await request.json();
  const { query, variables } = z
    .object({ query: z.string(), variables: z.string().optional() })
    .parse(body);

  const ast = parse(query, { noLocation: true });

  // Validate operation structure
  const operation = ast.definitions.find(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === 'OperationDefinition',
  );

  if (!operation) return new Response('No operation found', { status: 400 });

  const config = QUERY_WHITELIST.find(
    (entry) => entry.name === operation.name?.value && entry.type === operation.operation,
  );

  if (!config) return new Response('Operation not allowed', { status: 403 });

  try {
    assertFieldsAllowed(operation.selectionSet.selections, config.allowedFields);
  } catch (error) {
    console.log(error);

    return new Response('Query is invalid', { status: 400 });
  }

  const response = await client.fetch({
    document: graphql(query),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    variables: variables ? JSON.parse(variables) : undefined,
  });

  return new Response(JSON.stringify(response.data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

interface Allowed {
  [key: string]: Allowed | boolean | null | undefined;
}

function assertFieldsAllowed(
  selections: readonly SelectionNode[],
  allowed: Allowed,
  path: string[] = ['site'],
): asserts selections is readonly SelectionNode[] {
  selections.forEach((selection) => {
    if (selection.kind !== 'Field') return;

    const fieldName = selection.name.value;
    const currentPath = [...path, fieldName];

    if (!(fieldName in allowed)) {
      throw new Error(`Disallowed field: ${currentPath.join('.')}`);
    }

    const allowedValue = allowed[fieldName];

    if (allowedValue === true) {
      // All descendants allowed
      return;
    }

    if (typeof allowedValue === 'object' && allowedValue !== null) {
      if (!selection.selectionSet) {
        throw new Error(`Expected subfields for: ${currentPath.join('.')}`);
      }

      assertFieldsAllowed(selection.selectionSet.selections, allowedValue, currentPath);

      return;
    }

    if (typeof allowedValue !== 'object' && selection.selectionSet) {
      throw new Error(`Field ${currentPath.join('.')} does not allow subfields`);
    }
    // If allowedValue is falsy and no selectionSet, it's fine (already checked above)
  });
}
