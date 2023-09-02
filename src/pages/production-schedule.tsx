import React, { useState, useEffect } from "react";

import Graph from "@/src/components/Views/PS_Graph";
import GanttView from "@/src/components/Views/GanttView";

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
    updateDataWithJSON,
    updateJSONWithData,
    addDataToJSON,
    addJSONData,
    deconstructJobData
} from "@/lib/helper-functions";
import { revalidatePath } from "next/cache";

const categoryKey = "production-schedule";
const jobsKey = "production-schedule";

const customColumns = [
    {
        visibleIndex: 6,
        dataField: "units",
        caption: "Units",
        dataType: "number",
        alignment: "center",
        calculateCellValue: (cell: any) => cell.units
    },
    {
        visibleIndex: 7,
        dataField: "actualUnits",
        caption: "Actual Units",
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
    },
    {
        visibleIndex: 8,
        dataField: "unitsPerWeek",
        caption: "Units/Week",
        dataType: "number",
        alignment: "center",
        calculateCellValue: (cell: any) => cell.stickwall ? 0 : cell.unitsPerWeek
    },
]

export default function ProductionSchedulePage(props: any) {
    const { loadedJobs, loadedSettings } = props;

    const [tabs, setTabs] = useState([]);
    const [canEdit, setCanEdit] = useState(true);

    const [jobs, setJobs] = useState(deconstructJobData(loadedJobs, categoryKey));
    const [jobsData, setJobsData] = useState([]);

    const [settings, setSettings] = useState(loadedSettings);

    const [cols, setCols] = useState([]);
    const [colsX, setColsX] = useState([]);
    const [startDate, setStartDate] = useState(toMondayDate(new Date()));

    let newEndDate = toMondayDate(addDays(new Date(), 365));
    const [endDate, setEndDate] = useState(newEndDate);

    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const newJobs = JSON.parse(JSON.stringify(jobs));
        const firstJob = newJobs[0];

        const {
            newCols,
            newColsX
        } = calculateForOffSetsNew(firstJob.shopStart, startDate, endDate);

        newJobs.forEach((job: any, index: any) => {
            const startOffset = toWeeks(firstJob.shopStart, job.shopStart);
            const shopColor = settings.find((shop: any) => shop.ID === job.shopID);

            newCols.forEach((innerCol: any) => {
                let isDate =
                    parseInt(innerCol.offset) >= startOffset &&
                    parseInt(innerCol.offset) < startOffset + job.weeks;

                let dataField = innerCol.offset;
                const cellData = job.JSON[categoryKey][dataField];

                let displayUnits: any = {
                    cellColor: "",
                    actual: cellData
                        ? cellData.actual
                        : 0
                }

                if (isDate) {
                    displayUnits.cellColor = shopColor ? shopColor.color : "#1976d2";

                    const thisWeek = innerCol.offset - startOffset + 1;
                    displayUnits.planned = job.unitsPerWeek;

                    if (thisWeek == job.weeks) {
                        const remainderUnits = job.unitsPerWeek > 0 ? job.units % job.unitsPerWeek : 0;
                        displayUnits.planned = remainderUnits != 0 ? remainderUnits : job.unitsPerWeek;
                    }
                }

                newJobs[index][dataField] = displayUnits;
            })
        })
        setCols(newCols);
        setColsX(newColsX);
        setJobsData(newJobs);
    }, [jobs, startDate, endDate]);

    useEffect(() => {
        setTabs([
            {
                ID: 0,
                name: "Gantt",
                component: (
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
                        showEditButtons={true}
                        sortByShop={false}
                        defaultColor="#1976d2"
                        showShopButtons={true}
                        // showShopButtons={false}

                        saveByFieldStart={false}
                        saveByShopStart={false}

                        handleUpdate={handleUpdate}
                        handleAdd={handleAdd}
                        handleDelete={handleDelete}
                    />
                )
            },
            {
                ID: 1,
                name: "Units Graph",
                component: (
                    <Graph
                        jobs={jobsData}
                        shops={settings}
                    />
                )
            }
        ])
    }, [jobsData, settings, cols, colsX, startDate, endDate]);

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
            case "job":
                try {
                    const newData = updateJSONWithData(data, categoryKey);
                    // let resData = await postData("/PostJob", newData);
                    let resData = await postData("/GetJobs", newData);
                    resData = updateDataWithJSON(resData, categoryKey)

                    setJobs((prev: any) => {
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
            case "job":
                try {
                    const newData = updateJSONWithData(data, categoryKey);
                    // const resData = await deleteData("/DeleteJob", newData);
                    console.log(newData)
                    const resData = await deleteData("/GetJobs", newData);
                    setJobs((prev: any) => prev.filter((item: any) => item.ID !== newData.ID));
                } catch (error) { console.log(error) }
                break;
            default:
                break;
        }
    }

    const TabMenu = () => (
        <Box sx={{ width: "100%", marginBottom: "20px", display: "flex", justifyContent: "center" }}>
            <Tabs
                value={selectedIndex}
                onChange={(e, value) => setSelectedIndex(value)}
                variant="scrollable"
                scrollButtons="auto"
            >
                <Tab value={0} label='Gantt' />
                <Tab value={1} label='Graph' />
                {/* <Button
                    variant='text'
                    color='secondary'
                    href='http://wwweb/portal/desktopmodules/wwPMDashboard/PTSchedChart_extra.htm'
                >
                    PT Tracker
                </Button> */}
            </Tabs>
        </Box>
    );

    return (
        <div style={{ alignItems: "center", justifyContent: "center" }}>
            <TabMenu />
            <div style={{ marginTop: "20px" }}> {tabs[selectedIndex] && tabs[selectedIndex].component} </div>
        </div>
    )
}

export async function getStaticProps() {
    // const loadedJobs = await loadData("/GetJobs");
    // let loadedSettings = await loadData("/GetSettings");

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
            ID: item[0]
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