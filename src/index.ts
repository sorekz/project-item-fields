import fs from 'fs'
import * as core from '@actions/core'
import {
    GithubApi,
    isProjectV2ItemFieldDateValue,
    isProjectV2ItemFieldIterationValue,
    isProjectV2ItemFieldNumberValue,
    isProjectV2ItemFieldSingleSelectValue,
    isProjectV2ItemFieldTextValue
} from './github'

export async function run(): Promise<void> {
    try {
        const githubToken = core.getInput('github-token', { required: true })
        const itemId = core.getInput('item-id', { required: true })
        const jsonFile = core.getInput('json')

        const api = new GithubApi(githubToken)
        const fieldValues = await api.readItemFields(itemId)
        core.debug(JSON.stringify(fieldValues))

        for (const field of fieldValues) {
            const fieldName = field.field.name.toUpperCase().replace(" ", "_")
            if (isProjectV2ItemFieldTextValue(field)) {
                core.setOutput(fieldName, field.text)
            }
            if (isProjectV2ItemFieldSingleSelectValue(field)) {
                core.setOutput(fieldName, field.name)
            }
            if (isProjectV2ItemFieldNumberValue(field)) {
                core.setOutput(fieldName, field.number)
            }
            if (isProjectV2ItemFieldDateValue(field)) {
                core.setOutput(fieldName, field.date)
            }
            if (isProjectV2ItemFieldIterationValue(field)) {
                core.setOutput(fieldName, field.title)
            }
        }

        if (jsonFile) {
            fs.writeFileSync(jsonFile, JSON.stringify(fieldValues, undefined, 4))
        }
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message)
        }
    }
}
