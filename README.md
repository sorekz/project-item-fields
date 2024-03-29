# project-item-fields

Read fields from a project (beta) item.
This action is best used together with [actions/add-to-project](https://github.com/actions/add-to-project)

## Usage:
The [actions/add-to-project](https://github.com/actions/add-to-project) can be used to read the item-id of an issue in a project which then is the input into this action.
```yaml
on:
  issue_comment:
    types: [created]
  
jobs:
  read_status:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/add-to-project@v0.3.0
        id: add-project
        with:
          project-url: https://github.com/users/sorekz/projects/2
          github-token: ${{ secrets.GHPROJECT_SECRET }}
      - uses: sorekz/project-item-fields@v1
        id: item-fields
        with:
          item-id: ${{ steps.add-project.outputs.itemId }}
          github-token: ${{ secrets.GHPROJECT_SECRET }}
      - run: echo "Status: ${{ steps.item-fields.outputs.Status }}
```

## Adjust fields based on other fields:
A common use-case is to adjust the fields of a project item only for a certain state of that item.\
For example: When the issue is commented, move the item to the next status.
```yaml
on:
  issue_comment:
    types: [created]
  
jobs:
  read_status:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/add-to-project@v0.3.0
        id: add-project
        with:
          project-url: https://github.com/users/sorekz/projects/2
          github-token: ${{ secrets.GHPROJECT_SECRET }}
      - uses: sorekz/project-item-fields@v1
        id: item-fields
        with:
          item-id: ${{ steps.add-project.outputs.itemId }}
          github-token: ${{ secrets.GHPROJECT_SECRET }}
      # Update the status to "In Progress" when it currently is in "Todo"
      - uses: sorekz/update-project-fields@v1
        if: ${{ steps.item-fields.outputs.Status == 'Todo' }}
        with:
          project-url: https://github.com/users/sorekz/projects/2
          github-token: ${{ secrets.GHPROJECT_SECRET }}
          item-id: ${{ steps.add-project.outputs.itemId }}
          field-keys: Status
          field-values: In Progress
```

## Inputs
### github-token
**Required** Personal access token to read the project item. Usual permissions required are `project:read`

### item-id
**Required** The project item

### json
Write the project item fields to a json file.\
The json contains more field information. See [JSON File](#json-file)

## Outputs
The actions creates an output for each field in the item.

Common fields are:
- **Title** The item title
- **Status** The item status

If you have spaces or special characters in your field names you can use this syntax:
```yaml
if: ${{ steps.item-fields.outputs['123 My field'] == 'Todo' }}
```

## JSON File
```json
[
    {
        "__typename": "ProjectV2ItemFieldTextValue",
        "field": {
            "name": "Title"
        },
        "text": "Test item"
    },
    {
        "__typename": "ProjectV2ItemFieldSingleSelectValue",
        "field": {
            "name": "Status"
        },
        "name": "Todo",
        "nameHTML": "Todo",
        "optionId": "f75ad846"
    },
    {
        "__typename": "ProjectV2ItemFieldTextValue",
        "field": {
            "name": "Test Text"
        },
        "text": "Some text"
    },
    {
        "__typename": "ProjectV2ItemFieldNumberValue",
        "field": {
            "name": "Test Number"
        },
        "number": 42
    },
    {
        "__typename": "ProjectV2ItemFieldDateValue",
        "field": {
            "name": "Test Date"
        },
        "date": "2023-10-18"
    },
    {
        "__typename": "ProjectV2ItemFieldSingleSelectValue",
        "field": {
            "name": "Test_Single_Select"
        },
        "name": "Option 2",
        "nameHTML": "Option 2",
        "optionId": "ccb3f63d"
    },
    {
        "__typename": "ProjectV2ItemFieldIterationValue",
        "field": {
            "name": "Test_Iteration"
        },
        "duration": 14,
        "iterationId": "ceff780a",
        "title": "Test_Iteration 1",
        "titleHTML": "Test_Iteration 1"
    }
]
```
