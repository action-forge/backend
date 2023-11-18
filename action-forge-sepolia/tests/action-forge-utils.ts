import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ActionExecuted,
  ActionForgeRegistered,
  ETHReceived,
  OwnershipTransferred,
  RequestFulfilled,
  RequestSent,
  Response
} from "../generated/ActionForge/ActionForge"

export function createActionExecutedEvent(
  proposalId: Bytes,
  option: BigInt,
  actionType: i32
): ActionExecuted {
  let actionExecutedEvent = changetype<ActionExecuted>(newMockEvent())

  actionExecutedEvent.parameters = new Array()

  actionExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "proposalId",
      ethereum.Value.fromFixedBytes(proposalId)
    )
  )
  actionExecutedEvent.parameters.push(
    new ethereum.EventParam("option", ethereum.Value.fromUnsignedBigInt(option))
  )
  actionExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "actionType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(actionType))
    )
  )

  return actionExecutedEvent
}

export function createActionForgeRegisteredEvent(
  proposalId: Bytes,
  actionForgeId: Bytes,
  upkeepId: BigInt,
  createdBy: Address,
  proposal: ethereum.Tuple
): ActionForgeRegistered {
  let actionForgeRegisteredEvent = changetype<ActionForgeRegistered>(
    newMockEvent()
  )

  actionForgeRegisteredEvent.parameters = new Array()

  actionForgeRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "proposalId",
      ethereum.Value.fromFixedBytes(proposalId)
    )
  )
  actionForgeRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "actionForgeId",
      ethereum.Value.fromFixedBytes(actionForgeId)
    )
  )
  actionForgeRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "upkeepId",
      ethereum.Value.fromUnsignedBigInt(upkeepId)
    )
  )
  actionForgeRegisteredEvent.parameters.push(
    new ethereum.EventParam("createdBy", ethereum.Value.fromAddress(createdBy))
  )
  actionForgeRegisteredEvent.parameters.push(
    new ethereum.EventParam("proposal", ethereum.Value.fromTuple(proposal))
  )

  return actionForgeRegisteredEvent
}

export function createETHReceivedEvent(
  user: Address,
  amount: BigInt
): ETHReceived {
  let ethReceivedEvent = changetype<ETHReceived>(newMockEvent())

  ethReceivedEvent.parameters = new Array()

  ethReceivedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  ethReceivedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return ethReceivedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createRequestFulfilledEvent(id: Bytes): RequestFulfilled {
  let requestFulfilledEvent = changetype<RequestFulfilled>(newMockEvent())

  requestFulfilledEvent.parameters = new Array()

  requestFulfilledEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )

  return requestFulfilledEvent
}

export function createRequestSentEvent(id: Bytes): RequestSent {
  let requestSentEvent = changetype<RequestSent>(newMockEvent())

  requestSentEvent.parameters = new Array()

  requestSentEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )

  return requestSentEvent
}

export function createResponseEvent(
  requestId: Bytes,
  response: Bytes,
  err: Bytes
): Response {
  let responseEvent = changetype<Response>(newMockEvent())

  responseEvent.parameters = new Array()

  responseEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromFixedBytes(requestId)
    )
  )
  responseEvent.parameters.push(
    new ethereum.EventParam("response", ethereum.Value.fromBytes(response))
  )
  responseEvent.parameters.push(
    new ethereum.EventParam("err", ethereum.Value.fromBytes(err))
  )

  return responseEvent
}
