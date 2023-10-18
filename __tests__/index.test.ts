import fs from 'fs'
import * as core from '@actions/core'
import * as index from '../src/index'

// Start the tests with this environment variable set
// Permissions: project:read
const TEST_TOKEN = process.env.TEST_TOKEN!

// Mock the GitHub Actions core library
const getInputMock = jest.spyOn(core, 'getInput')
const setFailedMock = jest.spyOn(core, 'setFailed')
const setOutputMock = jest.spyOn(core, 'setOutput')

const writeFileSyncMock = jest.spyOn(fs, 'writeFileSync').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(index, 'run')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('read fields from test project', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'github-token':
          return TEST_TOKEN
        case 'item-id':
          // test item https://github.com/users/sorekz/projects/2?pane=issue&itemId=41936238
          return 'PVTI_lAHOABDFX84AW_8YzgJ_5W4'
        default:
          return ''
      }
    })

    await index.run()
    expect(runMock).toHaveReturned()

    expect(setOutputMock).toBeCalledWith('Title', 'Test item')
    expect(setOutputMock).toBeCalledWith('Status', 'Todo')
    expect(setOutputMock).toBeCalledWith('Test Text', 'Some text')
    expect(setOutputMock).toBeCalledWith('Test Number', 42)
    expect(setOutputMock).toBeCalledWith('Test Date', '2023-10-18')
    expect(setOutputMock).toBeCalledWith('Test_Single_Select', 'Option 2')
    expect(setOutputMock).toBeCalledWith('Test_Iteration', 'Test_Iteration 1')
  })

  it('read fields and write to json', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'github-token':
          return TEST_TOKEN
        case 'item-id':
          // test item https://github.com/users/sorekz/projects/2?pane=issue&itemId=41936238
          return 'PVTI_lAHOABDFX84AW_8YzgJ_5W4'
        case 'json':
          return 'some/path/out.json'
        default:
          return ''
      }
    })

    await index.run()
    expect(runMock).toHaveReturned()

    expect(setOutputMock).toBeCalledWith('Title', 'Test item')
    expect(setOutputMock).toBeCalledWith('Status', 'Todo')
    expect(setOutputMock).toBeCalledWith('Test Text', 'Some text')
    expect(setOutputMock).toBeCalledWith('Test Number', 42)
    expect(setOutputMock).toBeCalledWith('Test Date', '2023-10-18')
    expect(setOutputMock).toBeCalledWith('Test_Single_Select', 'Option 2')
    expect(setOutputMock).toBeCalledWith('Test_Iteration', 'Test_Iteration 1')

    expect(writeFileSyncMock).toBeCalledWith('some/path/out.json', fs.readFileSync('__tests__/test_out.json').toString())
  })

  it('read from invalid item id', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'github-token':
          return TEST_TOKEN
        case 'item-id':
          return 'invalid_0000123450000'
        default:
          return ''
      }
    })

    await index.run()
    expect(runMock).toHaveReturned()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      "Request failed due to following response errors:\n - Could not resolve to a node with the global id of 'invalid_0000123450000'"
    )
  })
})
