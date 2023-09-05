import React, { useState, useEffect } from "react";
import GanttView from "@/src/components/Views/GanttView";
import Colorkey from "@/src/components/Colorkey";

import { Button, Tabs, Tab, Box } from "@mui/material";
import {
    toMondayDate,
    addDays,
    toWeeks,
    loadData,
    putData,
    postData,
    deleteData,
    convertDates,
    calculateForOffSetsNew,
    updateJSONWithData,
    getDataByCategory,
    addJSONData,
    addDataToJSON,
    deconstructJobData
} from "@/lib/helper-functions";

const categoryKey = "field";
const jobsKey = "production-schedule";
const officialStartDate = "1/1/2022";

const customColumns: any = [
    {
        visibleIndex: 6,
        dataField: "employees",
        caption: "Avg # of Employees",
        dataType: "number",
        alignment: "center",
        calculateCellValue: (cell: any) => {
            let sum = 0;
            for (const key in cell) {
                if (!isNaN(parseInt(key)) && typeof cell[key].actual === "number") {
                    sum += cell[key].actual;
                }
            }
            return sum;
        }
    }
]

export default function FieldPage(props: any) {
    const { loadedJobs, loadedSettings } = props;

    const [jobs, setJobs] = useState(deconstructJobData(loadedJobs, categoryKey));
    const [jobsData, setJobsData] = useState([]);

    const [settings, setSettings] = useState(loadedSettings);

    const [cols, setCols] = useState([]);
    const [colsX, setColsX] = useState([]);
    const [startDate, setStartDate] = useState(toMondayDate(new Date()));

    let newEndDate = toMondayDate(addDays(new Date(), 365));
    const [endDate, setEndDate] = useState(newEndDate);

    useEffect(() => {

        const newJobs = JSON.parse(JSON.stringify(jobs));

        const {
            newCols,
            newColsX
        } = calculateForOffSetsNew(officialStartDate, startDate, endDate);

        newJobs.forEach((job: any, index: any) => {
            const fieldStartOffset = toWeeks(officialStartDate, job.fieldStart);
            const shopColor = settings.find((shop: any) => shop.ID === job.shopID);

            newCols.forEach((innerCol: any) => {
                const datafield = innerCol.offset;

                let displayUnits: any = {
                    cellColor: "",
                    linkToFieldStart: true,
                    fieldStartOffset: 0,
                    actual: 0
                }

                newJobs[index][datafield] = displayUnits;
            })

            for (let key in job.JSON[categoryKey]) {
                const cellData = job.JSON[categoryKey][key];

                if (cellData.actual && cellData.fieldStartOffset) {

                    let displayUnits: any = {
                        cellColor: "",
                        linkToFieldStart: true,
                        fieldStartOffset: cellData.fieldStartOffset,
                        actual: cellData.actual
                    }

                    if (displayUnits.actual > 0) {
                        displayUnits.cellColor = shopColor ? shopColor.color : "#1976d2";
                    }

                    // assign display units to appropriate innerCol value
                    const calculatedDatafield = fieldStartOffset + displayUnits.fieldStartOffset;
                    newJobs[index][calculatedDatafield] = displayUnits;
                }
            }
        })

        setJobsData(newJobs);
        setCols(newCols);
        setColsX(newColsX);
    }, [jobs, startDate, endDate]);

    const handleDateChange = (key: any, value: any) => {
        if (key === "startDate") {
            setStartDate(value);
        } else if (key === "endDate") {
            setEndDate(value);
        }
    }

    async function handleUpdate(data: any, endpoint: any) {
        switch (endpoint) {
            case "setting":
                try {
                    const newData = addDataToJSON(data);
                    // const resData = await putData("/UpdateSettings", newData);
                    const resData = await putData("/GetSettings", newData);
                    setSettings((prev: any) => {
                        let items = prev.filter((item: any) => data.ID !== item.ID);
                        return [...items, data];
                    })
                } catch (error) { console.log(error) }
                break;
            case "job":
                try {
                    const newData = updateJSONWithData(data, categoryKey);
                    console.log(data, newData)
                    // const resData = await putData("/PutJob", newData);
                    const resData = await putData("/GetJobs", newData);
                    setJobs((prev: any) => {
                        let items = prev.filter((item: any) => data.ID !== item.ID);
                        return [...items, data];
                    })
                } catch (error) { console.log(error) }
                break;
            default:
                break;
        }
    }

    async function handleAdd(data: any, endpoint: any) {
        switch (endpoint) {
            case "setting":
                try {
                    const newData = addDataToJSON(data);
                    // let resData = await postData("/AddSettings", newData);
                    let resData = await postData("/GetSettings", newData);
                    resData = addJSONData(resData);

                    setSettings((prev: any) => {
                        let items = prev.filter((item: any) => resData.ID !== item.ID && item.ID);
                        return [...items, resData];
                    })
                } catch (error) { console.log(error) }
                break;
            default:
                break;
        }
    }

    async function handleDelete(data: any, endpoint: any) {
        switch (endpoint) {
            case "setting":
                try {
                    const newData = addDataToJSON(data);
                    // const resData = await deleteData("/DeleteSettings", newData);
                    const resData = await deleteData("/GetSettings", newData);
                    setSettings((prev: any) => prev.filter((item: any) => item.ID !== newData.ID));
                } catch (error) { console.log(error) }
                break;
            default:
                break;
        }
    }

    return (
        <div>
            <GanttView
                jobs={jobsData}
                shopSettings={settings}

                columns={cols}
                columnsX={colsX}
                startDate={startDate}
                endDate={endDate}
                handleDateChange={handleDateChange}

                categoryKey={categoryKey}
                customColumns={customColumns}
                showEditButtons={false}
                linkToFieldStart={true}
                showShopButtons={true}

                saveByFieldStart={true}
                saveByShopStart={false}

                handleUpdate={handleUpdate}
                handleAdd={handleAdd}
                handleDelete={handleDelete}
            />
            <Colorkey
                engineering={true}
                booked={true}
                reserved={false}
                fieldStart={true}
                shopStart={true}
            />
        </div>

    )
}

export async function getStaticProps() {
    // const loadedJobs = await loadData("/GetJobs");
    // const loadedSettings = await getDataByCategory("/GetSettings", "shops");

    let loadedJobs = await loadData("/GetJobs");
    loadedJobs = Object.entries(loadedJobs).map((item: any) => {
        return {
            ...item[1],
            ID: item[0],
        }
    })

    let loadedSettings = await loadData("/GetSettings");
    loadedSettings = Object.entries(loadedSettings).map((item: any) => {
        return {
            ...item[1],
            ID: item[0],
        }
    })

    loadedSettings = loadedSettings
        .filter((setting: any) => setting.category === "shops")
        .map((setting: any) => addJSONData(setting))

    return {
        props: {
            loadedJobs,
            loadedSettings
        }
    }
}