import ExcelJS from "exceljs";

export default async function createExcelFile(workoutPlan) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Træningsplan");

  const columnHeaders = ["Træningsøvelse", "Sæt", "Reps", "Pause", "1", "2", "3", "4", "5"];
  const columnWidths = [35, 6, 8, 10, 10, 10, 10, 10, 10];

  columnHeaders.forEach((_, index) => {
    worksheet.getColumn(index + 1).width = columnWidths[index];
  });

  const relevantColumns = columnHeaders.map((_, index) => index + 1);

  let isWhiteBackground = true;

  for (const block of workoutPlan) {
    switch (block.type) {
      case "day":
        worksheet.addRow([]); //Tom række til at skabe mellemrum

        const dayRow = worksheet.addRow([block.day, "", "", "", "", "", "", "", ""]);
        worksheet.mergeCells(`A${dayRow.number}:I${dayRow.number}`);
        dayRow.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
        dayRow.getCell(1).alignment = { horizontal: "center" };

        const headerRow = worksheet.addRow(columnHeaders);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, name: "Calibri" };
        relevantColumns.forEach((col) => {
          headerRow.getCell(col).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF0000" } //Rød baggrund
          };
        });
        headerRow.alignment = { horizontal: "center" };
        headerRow.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
          };
        });

        isWhiteBackground = true;
        break;

      case "exercise":
        const noteCells = new Array(5).fill("");

        const exerciseRow = worksheet.addRow([
          block.exerciseName,
          block.sets,
          block.reps,
          block.rest,
          ...noteCells
        ]);
        exerciseRow.font = { name: "Calibri" };
        relevantColumns.forEach((col) => {
          exerciseRow.getCell(col).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: isWhiteBackground ? "FFFFFFFF" : "FFD3D3D3" } //Skiftevis grå og hvid baggrund
          };
        });
        isWhiteBackground = !isWhiteBackground;

        exerciseRow.alignment = { horizontal: "center" };
        exerciseRow.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
          };
        });
        break;

      default:
        console.warn(`Unknown block type: ${block.type}`);
        break;
    }
  }
  const buffer = await workbook.xlsx.writeBuffer();//Gemmer filen i hukommelse
  return buffer.toString('base64');
}

