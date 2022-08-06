import { FieldTypeEnum } from "../../../../common/enum";
import { firstCharToLower, firstCharToUpper } from "../../../../util/util"
import { PageRule, FieldSettingModel } from "../../../../type/model"

const getAllFields = (formSettingData: PageRule) => {
    const allFields: FieldSettingModel[] = []
    formSettingData.cards.forEach(card => {
        card.rows.forEach(row => {
            row.fields.forEach(field => {
                allFields.push(field)
            })
        })
    })

    return allFields
}

const getDependCode = (allFields: FieldSettingModel[]) => {
    let interfaceDefinition = ''
    let initialState = ''
    const interfaceDefinitionArr: string[] = []
    const initialStateArr: string[] = []
    if(allFields.length > 0){
        allFields.forEach(x => {
            interfaceDefinitionArr.push(`${x.fieldName}?: ${x.fieldDataType}`)
            if(x.fieldType === FieldTypeEnum.treeSelect){
                interfaceDefinitionArr.push(`${x.fieldName}TreeData?: OptionType[]`)
            }

            if(x.defaultValue){
                let defaultValue = x.fieldDataType === 'string' ? `'${x.defaultValue}'` : x.defaultValue
                initialStateArr.push(
                    `${x.fieldName}: ${defaultValue}`
                )
            }
        })
        
        interfaceDefinition = interfaceDefinitionArr.join(';\n    ') + ';'
        initialState = initialStateArr.join(',\n    ')
    }
   

    return { interfaceDefinition, initialState }
}
let moduleNameLower = ''
export const generateReduxSlice = (formSettingData: PageRule) => {
    moduleNameLower = firstCharToLower(formSettingData.moduleName)
    const allFields = getAllFields(formSettingData)
    const dependCode = getDependCode(allFields)

    const code = `import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { OptionType } from '../../common/type';
export interface FieldChange {
    fieldName: string;
    fieldValue?: string | number | boolean | OptionType;
}

export interface ${firstCharToUpper(formSettingData.moduleName)} {
    ${dependCode.interfaceDefinition}
}

export interface ReduxData {
    ${moduleNameLower}: ${firstCharToUpper(formSettingData.moduleName)};
}

const initialState: ReduxData = {
    ${moduleNameLower}:{
        ${dependCode.initialState}
    }
};

export const ${moduleNameLower}Slice = createSlice({
    name: '${moduleNameLower}',
    initialState,
    reducers: {
        changeField: (state, action: PayloadAction<FieldChange>) => {
            (state.${moduleNameLower} as any)[action.payload.fieldName] = action.payload.fieldValue
        },
    },
});

export const ${moduleNameLower}Reducer = (state: RootState) => state.${firstCharToLower(formSettingData.moduleName)};
export const { changeField } = ${moduleNameLower}Slice.actions
export default ${moduleNameLower}Slice.reducer;

`

    return code
}
