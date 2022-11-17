import RpcError from '@server/common/rpc.error';

export function normalizeInput(input: string, maxLength: number): string {
  const normalizedInput = input.trim().replace(/\s{2,}/g, ' ');

  if (!normalizedInput || normalizedInput.length > maxLength) {
    throw new RpcError('Invalid Data');
  }

  return normalizedInput;
}
