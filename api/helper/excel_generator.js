const path = require("path");
const fs = require("fs");
const config = require("../config/index")
const Excel = require('exceljs');
const { Console } = require("console");

exports.excel_generator = async (header = [], data = [], fileName, dates, timeColumn = [], tableLine = [], title, mergeCells) => {
    return new Promise((resolve, reject) => {
        try {
            let workbook = new Excel.Workbook()
            let ws = workbook.addWorksheet('Report 1')
            const datas = data
            const headers = header
            ws.columns = headers

            ws.columns.forEach(column => {
                column.width = column.header.length < 12 ? 12 : column.header.length
            })

            datas.forEach((e, index) => {
                // row 1 is the header.
                const rowIndex = index + 2
                ws.addRow({
                    ...e, no: index + 1

                })

                const figureColumns = timeColumn
                figureColumns.forEach((i) => {
                    ws.getColumn(i).numFmt = 'hh:mm:ss';
                })



                ws.eachRow({ includeEmpty: false }, function (row, rowNumber) {
                    const insideColumns = tableLine
                    insideColumns.forEach((v) => {
                        ws.getCell(`${v}${rowNumber}`).border = {
                            top: { style: 'thin' },
                            bottom: { style: 'thin' },
                            left: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    })
                })
            })
            ws.getRow(1).font = {bold: true}




            ws.insertRow(1, "");
            ws.insertRow(2, "");
            ws.mergeCells(mergeCells)
            ws.getCell('A1').value = title;
            ws.insertRow(3, "");
            ws.insertRow(4, ['Date:', dates]);
            ws.insertRow(5, "");

            ws.getCell('A1').font = {
                name: 'Comic Sans MS',
                family: 4,
                size: 20,
                underline: true,
                bold: true
            };
            ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

            workbook.xlsx.writeFile(`${config.folderNameReport}${path.sep}${fileName}.xlsx`);
            resolve({
                filename: `${fileName}.xlsx`,
                url: `/downloads/${fileName}.xlsx`
            })
        } catch (e) {
            reject(e)
            console.log(e.message);
            throw e;
        }
    })
}

exports.excel_generator_qa = async (header = [], data = [], fileName,  timeColumn = [], tableLine = [], title, mergeCells , mergeCells2,  calldate, durasi, customer_name, card_number, QA_by, agent, qa_notes, periods) => {
    return new Promise((resolve, reject) => {
        try {
            
            let workbook = new Excel.Workbook()
            let ws = workbook.addWorksheet('Report 1')
            const datas = data
            const headers = header
            ws.columns = headers

            ws.columns.forEach(column => {
                column.width = column.header.length > 10 ? 90 : column.header.length + 5
            })

            datas.forEach((e, index) => {
                // row 1 is the header.
                const rowIndex = index + 2
                ws.addRow({
                    ...e, no: index + 1

                })

                const figureColumns = timeColumn
                figureColumns.forEach((i) => {
                    ws.getColumn(i).numFmt = 'hh:mm:ss';
                })



                ws.eachRow({ includeEmpty: false }, function (row, rowNumber) {
                    const insideColumns = tableLine
                    insideColumns.forEach((v) => {
                        ws.getCell(`${v}${rowNumber}`).border = {
                            top: { style: 'thin' },
                            bottom: { style: 'thin' },
                            left: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    })
                })
            })
            ws.getRow(1).font = {bold: true}




            ws.insertRow(1, "");
            ws.insertRow(2, "");
            ws.insertRow(3, "");
            ws.mergeCells(mergeCells)
            ws.mergeCells(mergeCells2)
            ws.getCell('A1').value = title;  
            ws.getCell('A3').value = periods;     
            ws.getCell('F4').value = "Keterangan :";
            ws.getCell('F5').value = "Durasi : " +durasi;
            ws.getCell('F6').value = "Waktu Interaksi : " +calldate;
            ws.getCell('F7').value = "No Kartu : " +card_number;
            ws.getCell('F8').value = "a/n : " +customer_name;
            ws.getCell('F9').value = "QA By : " +QA_by;
            ws.getCell('F10').value = "Agent : " +agent;
            ws.getCell('F11').value = "Catatan : " +qa_notes;




            ws.getCell('A1').font = {
                name: 'Comic Sans MS',
                family: 4,
                size: 20,
                underline: true,
                bold: true
            };
            ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
            ws.getCell('A3').font = {
                name: 'Arial',
                family: 4,
                size: 11,
                underline: true,
                bold: true
            };
            ws.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };


            workbook.xlsx.writeFile(`${config.folderNameReport}${path.sep}${fileName}.xlsx`);
            resolve({
                filename: `${fileName}.xlsx`,
                url: `/downloads/${fileName}.xlsx`
            })
        } catch (e) {
            reject(e)
            console.log(e.message);
            throw e;
        }
    })
}





