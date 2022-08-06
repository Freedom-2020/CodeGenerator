import express from 'express';
import bodyParser from "body-parser";
import fs from 'fs';
import { generatePage } from './src/templete/react/ant-redux-ts/v1/render'
import { generateReduxSlice } from './src/templete/react/ant-redux-ts/v1/reduxSlice'
import { firstCharToUpper } from './src/util/util'

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/save', (request, response) =>{
    const moduleName = firstCharToUpper(request.body.moduleName)
    fs.writeFile(
        `${request.body.filePath}/${moduleName}.tsx`, 
        generatePage(request.body), 
        function (err) {
            if (err) throw err;
            fs.writeFile(
                `${request.body.filePath}/${moduleName}Slice.ts`, 
                generateReduxSlice(request.body), 
                function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                    fs.writeFile('./pageRule.json', JSON.stringify(request.body.cards,null,4), function(){})
                    response.send(JSON.stringify(true))
                }
            );
        }
      );
})

app.get('/api/get', (request, response) => {
    const data = fs.readFileSync('./pageRule.json', 'utf-8')
    response.send(data)
})

app.get('/api/getTree', (request, response) => {
    const data=[
    {
        value: '1',
        label: 'label1',
        key: '1',
        children:[
            {
                value: '1-1',
                label: 'label1-1',
                key: '1-1',
                children: [
                    {
                        value: '1-1-1',
                        label: 'label1-1-1',
                        key: '1-1-1',
                    }
                ]
            },
            {
                value: '1-2',
                label: 'label1-2',
                key: '1-2',
            }
        ]
    },
    {
        value: '2',
        label: 'label2',
        key: '2',
        children:[
            {
                value: '2-1',
                label: 'label2-1',
                key: '2-1',
            }
        ]
    }
]
    response.send(JSON.stringify(data))
})

app.listen(3301, () => {
    console.log(`Server running`)
})