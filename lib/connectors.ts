import { createConnectors } from './connector-contract.mjs';
import { findConnectorBinding } from './connector-context';

/** Keep invocation context on this request; never cache it across visitors. */
export function getRequestConnectors() {
  return createConnectors(findConnectorBinding());
}
export type {
  ConnectorContext,
  ConnectorResult,
  ConnectorFailureStatus,
  Json,
} from './connector-contract.mjs';
