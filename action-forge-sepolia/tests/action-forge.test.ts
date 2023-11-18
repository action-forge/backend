import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import { ActionExecuted } from "../generated/schema"
import { ActionExecuted as ActionExecutedEvent } from "../generated/ActionForge/ActionForge"
import { handleActionExecuted } from "../src/action-forge"
import { createActionExecutedEvent } from "./action-forge-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let proposalId = Bytes.fromI32(1234567890)
    let option = BigInt.fromI32(234)
    let actionType = 123
    let newActionExecutedEvent = createActionExecutedEvent(
      proposalId,
      option,
      actionType
    )
    handleActionExecuted(newActionExecutedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ActionExecuted created and stored", () => {
    assert.entityCount("ActionExecuted", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ActionExecuted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "proposalId",
      "1234567890"
    )
    assert.fieldEquals(
      "ActionExecuted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "option",
      "234"
    )
    assert.fieldEquals(
      "ActionExecuted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "actionType",
      "123"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
