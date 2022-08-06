import { FieldTypeEnum, ValidationTypeEnum } from "../../../../common/enum";
import { firstCharToLower, firstCharToUpper } from "../../../../util/util"
import { PageRule, FieldSettingModel, Validation, RowModel, CardModel, ItemSource } from "../../../../type/model"

const getDatePicker = (field: FieldSettingModel) => {
    const code = 
                                `<DatePicker ${getDisabledAttr(field)} className="fullWidth" />`
    return code
}

const getSelect = (field: FieldSettingModel) => {
    const code = 
                                `<Select ${getDisabledAttr(field)} className="fullWidth">
                                    {${field.fieldName}Options.map(option => 
                                        <Option key={option.value} value={option.value}>{option.label}</Option>
                                    )}
                                </Select>`
    return code
}

const getTreeSelect = (field: FieldSettingModel) => {
    const code = 
                                `<TreeSelect ${getDisabledAttr(field)} treeData={${fromModelPath()}.${field.fieldName}TreeData} className="fullWidth" />`
        
return code
}

const getRadio = (field: FieldSettingModel) => {
    const code =
                                `<Radio.Group ${getDisabledAttr(field)} defaultValue="${field.defaultValue}" className="fullWidth">
                                    {${field.fieldName}Options.map(option => 
                                        <Radio key={option.value} value={option.value}>{option.label}</Radio>
                                    )}
                                </Radio.Group>`
    return code
}

const getInputNumber = (field: FieldSettingModel) => {
    const code = 
                                `<InputNumber ${getDisabledAttr(field)} ${getAttr(field, 'min')} ${getAttr(field, 'max')} ${getAttr(field, 'precision')} className="fullWidth" />`
    return code
}

const getInputText = (field: FieldSettingModel) => {
    const code = 
                                `<Input ${getDisabledAttr(field)} ${getAttr(field, 'maxLength')} />`
    return code
}

const getAttr = (field: any, attrName: string)=> {
    if(field[attrName] !== undefined){
        return `${attrName}={${field[attrName]}}`
    }
    return ''
}

const getDisabledAttr = (field: FieldSettingModel) => {
    if(field.disabled){
        if(field.disabled === 'true'){
            return 'disabled={true}'
        }else{
            return `disabled={${field.fieldName}Disabled()}`
        }
    }
    return ''
}

const getFieldControl = (field: FieldSettingModel) => {
    let code = ''
    switch (field.fieldType) {
        case FieldTypeEnum.inputText:
            code = getInputText(field) 
            break;
        case FieldTypeEnum.number:
            code = getInputNumber(field) 
            break;  
        case FieldTypeEnum.select:
            code = getSelect(field) 
            break;  
        case FieldTypeEnum.treeSelect:
            code = getTreeSelect(field) 
            break; 
        case FieldTypeEnum.radio:
            code = getRadio(field) 
            break;   
        case FieldTypeEnum.datePicker:
            code = getDatePicker(field) 
            break;    
    
        default:
            code = ''
    }

    return code
}

const getOneRule = (validation: Validation, isLast: boolean, fieldName: string) => {
    let code = ''
    switch (validation.name) {
        case ValidationTypeEnum.required:
            code = 
                                    `{ required: true, ${validation.errorMessage ? `message: '${validation.errorMessage}'` : ''} },`
            break;
        case ValidationTypeEnum.pattern:
            code = 
                                    `{ pattern: ${validation.pattern}, ${validation.errorMessage ? `message: '${validation.errorMessage}'` : ''} },`
            break;
        case ValidationTypeEnum.validator:
            code = 
                                    `${fieldName}Validator(),`
            break;
    
        default:
            break;
    }

    if(!isLast){
        code += `
                                    `
    }

    return code
}
const getFieldValidationRules = (validations: Validation[], fieldName: string) => {
    let code = ''
    if(validations.length > 0){
        let rules = ''
        validations.forEach((validation, idx) => {

            rules += getOneRule(validation, idx === validations.length -1, fieldName)
        })

        code = 
                                `rules={[
                                    ${rules}
                                ]}`
    }

    return code
}

const getLabel = (field: FieldSettingModel)=> {
    if(!field.label){
        return "''"
    }
    const expressionResult = transformExpressionUseFormInstance(field.label, field.fieldName)
    if(expressionResult.dependOtherFields.length > 0){
        return `{${expressionResult.expression}}`
    }else{
        return `"${expressionResult.expression}"`
    }
}

const getFormItems = (field: FieldSettingModel) => {
    let code =
                            `<Form.Item 
                                name="${field.fieldName}" 
                                label=${getLabel(field)}${
                                field.validations &&  field.validations.length > 0 ? 
                                `
                                ${getFieldValidationRules(field.validations, field.fieldName)}>` : 
                                '>'}

                                ${getFieldControl(field)}
                            </Form.Item>`
    return code
}

const getCols = (fields: FieldSettingModel[]) => {
    let code = ''
    fields.forEach((field, idx) => {
        let col = 
                        `<Col span={${field.colSpan}}>
                            ${getFormItems(field)}
                        </Col>`
        if(field.display){
            col =  `
                        {${field.fieldName}Display() &&
                            ${col}
                        }`
        }

        code += col
        if(idx !== fields.length -1){
            code += `
                        `
        }
    })
    

    return code
}

const getRows = (rows: RowModel[]) => {
    let code = ''
    rows.forEach((row, idx) => {
        code += 
                    `<Row gutter={${row.gutter}}>
                        ${getCols(row.fields)}
                    </Row>`

        if(idx !== rows.length -1){
            code += `
                    `
        }
    })

    return code
}

const getCards = (cards: CardModel[]) => {
    let code = ''
    cards.forEach((card, idx) => {
        code += 
                `<Card title="${card.cardTitle}" type="inner">
                    ${getRows(card.rows)}
                </Card>`

        if(idx !== cards.length -1){
            code += `
                `
        }
    })

   return code
}

const generateRender = (formSettingData: PageRule, initialValues: string) => {
    const code = 
        `<div>
            <Form 
                form={${formName()}} 
                onFinish={onFinish} 
                name="testForm" 
                layout="vertical"${initialValues ? '\n' + '                initialValues={initialValues}                 ' : ''}
                onValuesChange={onValuesChange}>

                ${getCards(formSettingData.cards)}
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>`

    return code
}

const transformExpressionUseFormInstance = (expression: string, fieldName: string) => {
    const sourseFields = expression.match(/{[\w.\[\]]+}/g)
    const transFormArr: {sourseField:string, transform: string}[] = []
    const dependOtherFields: string[] = []
    sourseFields?.forEach(sourseField => {
        const sourseFieldArr = sourseField.slice(1, sourseField.length - 1).split('.')
        if(sourseFieldArr.length > 1 && sourseFieldArr[0].toUpperCase() === moduleName.toUpperCase()){
            const fieldPath = `${fromModelPath()}.${sourseFieldArr[1]}`
            transFormArr.push({sourseField, transform: fieldPath}) 
            if(sourseFieldArr[1] !== fieldName){
                dependOtherFields.push(fieldPath)
            }
        }
    })

    let result = expression
    transFormArr.forEach(x => {
        result = result.replace(new RegExp(x.sourseField, 'g'), x.transform)
    })

    return {expression: result, dependOtherFields}
}

const getFieldValidator = (validation: Validation, fieldName: string) => {
    const expressionResult = transformExpressionUseFormInstance(validation.customizeValidator!, fieldName)
    let code = 
    `const ${fieldName}Validator = () => {
        return () => ({
            validator() {
                if (${expressionResult.expression}) {
                    return Promise.resolve();
                }

                return Promise.reject(new Error('${validation.errorMessage || ''}'));
            },
        })
    }
    `
    if(expressionResult.dependOtherFields.length > 0){
        code += `useDidUpdateEffect(()=>{
            ${formName()}.validateFields(['${fieldName}'])
        }, [${expressionResult.dependOtherFields.join(',')}])
        `
    }

    return code
}

const getOptions = (options: ItemSource[]) => {
    let code = ''
    options.forEach((option, idx) => {
        code += 
`   { label: '${option.label}', value: '${option.value}' },`

        if(idx !== options.length -1){
            code += '\n'
        }
    })

    return code
}

const getFieldOption = (options: ItemSource[], fieldName: string) => {
    return `
const ${fieldName}Options = [
${getOptions(options)}
]`
}

const getDependCode = (formSettingData: PageRule) => {
    const dependCode = {
        antdDepend: '',
        fieldValidator: '',
        initialValues: '',
        fieldOptions: '',
        fieldDisplay: '',
        fieldDisabled: '',
        fieldCalculatedValue: '',
        fetchData: ''
    }

    const antdDependComponent = new Set()
    const fieldValidator: string[] = []
    const initialValuesArr: string[] = []
    const fieldOptionArr: string[] = []
    const fieldDisplayArr: string[] = []
    const fieldDisabledArr: string[] = []
    const fieldCalculatedValueArr: string[] = []
    const fetchDataArr: string[] = []
    formSettingData.cards.forEach(card => {
        card.rows.forEach(row => {
            row.fields.forEach(field => {
                if(Object.values(FieldTypeEnum).includes(field.fieldType)){
                    antdDependComponent.add(field.fieldType)
                }

                if(field.validations){
                    const validation = field.validations.find(x => x.name === ValidationTypeEnum.validator)
                    if(validation){
                        fieldValidator.push(getFieldValidator(validation, field.fieldName))
                    }
                }

                if(field.defaultValue){
                    let defaultValue = field.fieldDataType === 'string' ? `'${field.defaultValue}'` : `${field.defaultValue}` 
                    initialValuesArr.push(
                        `${field.fieldName}: ${defaultValue},`
                    )
                }

                if(field.fieldType === FieldTypeEnum.select || field.fieldType === FieldTypeEnum.radio){
                    if(field.options){
                        fieldOptionArr.push(getFieldOption(field.options, field.fieldName))
                    }
                }

                if(field.display){
                    const expressionResult = transformExpressionUseFormInstance(field.display, field.fieldName)
                    if(expressionResult.dependOtherFields.length > 0){
                        const code = `
    function ${field.fieldName}Display(){
        return ${expressionResult.expression}
    }
                        `
                        fieldDisplayArr.push(code)
                    }
                }

                if(field.disabled && field.disabled !== 'true'){
                    const expressionResult = transformExpressionUseFormInstance(field.disabled, formSettingData.moduleName)
                    if(expressionResult.dependOtherFields.length > 0){
                        const code = `
                            function ${field.fieldName}Disabled(){
                                return ${expressionResult.expression}
                            }
                        `
                        fieldDisabledArr.push(code)
                    }
                }

                if(field.calculatedValue){
                    const expressionResult = transformExpressionUseFormInstance(field.calculatedValue, field.fieldName)
                    if(expressionResult.dependOtherFields.length > 0){
                        const code = `
                            useEffect(()=>{
                                const value = ${expressionResult.expression}
                                dispatch(changeField({fieldName:  '${field.fieldName}', fieldValue: value}))
                                ${formName()}.setFieldsValue({${field.fieldName}: value})
                            }, [${expressionResult.dependOtherFields.join(',')}])
                        `
                        fieldCalculatedValueArr.push(code)
                    }
                }

                if(field.fieldType === FieldTypeEnum.treeSelect && field.sourceUrl){
                    const code = `
            const fetch${field.fieldName}TreeData = async ()=>{
                const response = await fetch('${field.sourceUrl}',{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    })
                const data = (await response.json()) as OptionType
                dispatch(changeField({fieldName:  '${field.fieldName}TreeData', fieldValue: data}))
            }
            fetch${field.fieldName}TreeData()
                        `
                    fetchDataArr.push(code)
                }
            })
        })
    })

    dependCode.antdDepend = `import { Form, Card, Row, Col, Button, ${Array.from(antdDependComponent).join(', ')} } from "antd";`
    dependCode.fieldValidator = fieldValidator.join('\n    ')
    dependCode.fieldDisplay = fieldDisplayArr.join('\n    ')
    dependCode.fieldDisabled = fieldDisabledArr.join('\n    ')
    dependCode.fieldCalculatedValue = fieldCalculatedValueArr.join('\n    ')
    if(initialValuesArr.length > 0){
        dependCode.initialValues = `const initialValues = {
        ${initialValuesArr.join('\n        ')}
    }`
    }

    if(fetchDataArr.length > 0){
        dependCode.fetchData = `
        useEffect(()=>{
            ${fetchDataArr.join('\n        ')}
        }, [])
    `
    }
    
    dependCode.fieldOptions = fieldOptionArr.join('\n    ')
    return dependCode
}

function moduleNameReducer(){
    return `${moduleName}Reducer`
}

function moduleState(){
    return `${moduleName}State`
}

function formName(){
    return `form${firstCharToUpper(moduleName)}`
}

function fromModelPath(){
    return `${moduleState()}.${moduleName}`
}

let moduleName = ''
export const generatePage = (formSettingData: PageRule) => {
    moduleName = firstCharToLower(formSettingData.moduleName) 
    const dependCode = getDependCode(formSettingData);

    const code = 
`import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import moment from 'moment';
${dependCode.antdDepend}
${dependCode.fetchData ? "import { OptionType } from '../../common/type';": ''}
import { ${moduleNameReducer()}, changeField } from './${firstCharToUpper(moduleName)}Slice'
${dependCode.antdDepend.includes('Select') ? 'const Option=Select.Option': ''}
${dependCode.fieldOptions}


function useDidUpdateEffect(fn: Function, inputs: any){
    const didMountRef = useRef(false)
    useEffect(() => {
        if(didMountRef.current){
            fn()
        }else{
            didMountRef.current = true
        }
    }, inputs)
}

function ${firstCharToUpper(moduleName)}() {
    const ${moduleState()} = useAppSelector(${moduleNameReducer()});
    const dispatch = useAppDispatch();
    const [${formName()}] = Form.useForm()
    ${dependCode.fetchData?dependCode.fetchData: ''}
    const onFinish = (values: any) => {
        console.log('Received values of form: ', values);
    };
    ${
        dependCode.initialValues ? 
        dependCode.initialValues + `
        ` : 
        ''
    }
    ${dependCode.fieldValidator}
    ${dependCode.fieldCalculatedValue}
    ${dependCode.fieldDisplay}
    ${dependCode.fieldDisabled}
    const onValuesChange = (fields:any) =>{
        Object.keys(fields).forEach(key => {
            dispatch(changeField({fieldName:  key, fieldValue: fields[key]}))
        });
    }
    return (
        ${generateRender(formSettingData, dependCode.initialValues)}
    )
}

export default ${firstCharToUpper(moduleName)}`

    return code
}