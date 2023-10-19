import * as github from '@actions/github'

export type ProjectV2ItemFieldValueCommon = {
    __typename: string
    field: {
        name: string
    }
}
export function isProjectV2ItemFieldValueCommon(obj: any): obj is ProjectV2ItemFieldValueCommon {
    return "__typename" in obj && "field" in obj && "name" in obj.field
}
export type ProjectV2ItemFieldTextValue = ProjectV2ItemFieldValueCommon & {
    text: string
}
export function isProjectV2ItemFieldTextValue(obj: ProjectV2ItemFieldValueCommon): obj is ProjectV2ItemFieldTextValue {
    return obj.__typename == "ProjectV2ItemFieldTextValue"
}
export type ProjectV2ItemFieldSingleSelectValue = ProjectV2ItemFieldValueCommon & {
    __typename: "ProjectV2ItemFieldSingleSelectValue"
    name: string
}
export function isProjectV2ItemFieldSingleSelectValue(obj: ProjectV2ItemFieldValueCommon): obj is ProjectV2ItemFieldSingleSelectValue {
    return obj.__typename == "ProjectV2ItemFieldSingleSelectValue"
}
export type ProjectV2ItemFieldNumberValue = ProjectV2ItemFieldValueCommon & {
    number: number
}
export function isProjectV2ItemFieldNumberValue(obj: ProjectV2ItemFieldValueCommon): obj is ProjectV2ItemFieldNumberValue {
    return obj.__typename == "ProjectV2ItemFieldNumberValue"
}
export type ProjectV2ItemFieldDateValue = ProjectV2ItemFieldValueCommon & {
    date: string
}
export function isProjectV2ItemFieldDateValue(obj: ProjectV2ItemFieldValueCommon): obj is ProjectV2ItemFieldDateValue {
    return obj.__typename == "ProjectV2ItemFieldDateValue"
}
export type ProjectV2ItemFieldIterationValue = ProjectV2ItemFieldValueCommon & {
    title: string
}
export function isProjectV2ItemFieldIterationValue(obj: ProjectV2ItemFieldValueCommon): obj is ProjectV2ItemFieldIterationValue {
    return obj.__typename == "ProjectV2ItemFieldIterationValue"
}

export class GithubApi {

    octokit: ReturnType<typeof github.getOctokit>

    constructor(token: string) {
        this.octokit = github.getOctokit(token)
    }

    async readItemFields(itemId: string) {
        let hasNextPage = true
        let cursor = ""
        const fieldValues: ProjectV2ItemFieldValueCommon[] = []
        while (hasNextPage) {
            const result = await this.octokit.graphql<{
                node: {
                    fieldValues: {
                        nodes: any[]
                        pageInfo: {
                            hasNextPage: boolean
                            endCursor: string
                        }
                    }
                }
            }>(
                `query($id: ID!, $cursor: String) {
                    node(id: $id) {
                        ... on ProjectV2Item {
                            fieldValues(first: 100, after: $cursor) {
                                nodes {
                                    __typename
                                    ... on ProjectV2ItemFieldValueCommon {
                                        field {
                                            ... on ProjectV2FieldCommon {
                                                name
                                            }
                                        }
                                        ... on ProjectV2ItemFieldTextValue {
                                            text
                                        }
                                        ... on ProjectV2ItemFieldSingleSelectValue {
                                            name
                                            nameHTML
                                            optionId
                                        }
                                        ... on ProjectV2ItemFieldNumberValue {
                                            number
                                        }
                                        ... on ProjectV2ItemFieldDateValue {
                                            date
                                        }
                                        ... on ProjectV2ItemFieldIterationValue {
                                            duration
                                            iterationId
                                            title
                                            titleHTML
                                        }
                                    }
                                }
                                pageInfo {
                                    hasNextPage
                                    endCursor
                                }
                            }
                        }
                    }
                }
                `,
                {
                    id: itemId,
                    cursor
                }
            )
            console.log(JSON.stringify(result))

            for(const node of result.node.fieldValues.nodes) {
                if(isProjectV2ItemFieldValueCommon(node)) {
                    fieldValues.push(node)
                }
            }

            hasNextPage = result.node.fieldValues.pageInfo.hasNextPage
            cursor = result.node.fieldValues.pageInfo.endCursor
        }

        return fieldValues
    }
}
