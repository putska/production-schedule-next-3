import React, { useState, useEffect } from "react";
import {
    loadData,
    putData,
    postData,
    deleteData,
    loadAllActivitiesDates,
    updateJSONWithData,
    addJSONData,
    addDataToJSON,
    deconstructJobData,
    createCategoryData
} from "@/lib/helper-functions";

import CustomView from "@/src/components/Views/CustomView";
import { Button } from "@mui/material";

const categoryKey = "all-activities";
const fabDrawings_categoryKey = "fab-matrix";
const shopDrawings_categoryKey = "shop-drawings";
const jobsKey = "production-schedule";

export default function PanelMatrixPage(props: any) {
    const {
        loadedJobs,
        loadedTasks,
        loadedSettings,
        dates
    } = props;

    const [tasks, setTasks] = useState(loadedTasks);
    const [fabMatrixs, setFabMatrixs] = useState([]);
    const [shopDrawings, setShopDrawings] = useState([]);

    const [canEdit, setCanEdit] = useState(true);

    const [jobs, setJobs] = useState(deconstructJobData(loadedJobs, categoryKey));
    const [shops, setShops] = useState(loadedSettings.filter((setting: any) => setting.category === "shops"))
    const [settings, setSettings] = useState(loadedSettings.filter((setting: any) => setting.category === categoryKey));

    const [currCategoryData, setCurrCategoryData] = useState([]);

    useEffect(() => {
        let newCategoryData = createCategoryData(jobs, categoryKey, tabColumns);

        setShopDrawings(tasks.filter((task: any) => task.category === shopDrawings_categoryKey));
        setFabMatrixs(tasks.filter((task: any) => task.category === fabDrawings_categoryKey));

        setCurrCategoryData(newCategoryData);
    }, [jobs])

    async function handleUpdate(data: any, endpoint: any) {
        switch (endpoint) {
            case "job":
                try {
                    const newData = updateJSONWithData(data, categoryKey);
                    // const resData = await putData("/PutJob", newData);
                    const resData = await putData("/GetJobs", newData);
                    setJobs((prev: any) => {
                        let items = prev.filter((item: any) => newData.ID !== item.ID);
                        return [...items, newData];
                    })
                } catch (error) { console.log(error) }
                break;
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

    const renderDateCell = (rowData: any, type: any) => {
        const typeMapping: any = {
            "metalTakeoff": "2",
            "fieldStart": "9",
            "shopStart": "8",
            "doorSchedule": "10",
            "glassTakeoff": "4",
            "panelFabs": "4",
            "shopUseBrakeShapesAndSteel": "3",
            "fabDrawings": "7"
        };

        const dateMapping: any = {
            "metalTakeoff": rowData.metalTakeoff,
            "fieldStart": rowData.fieldStart,
            "shopStart": rowData.start,
            "doorSchedule": rowData.doorSchedule,
            "glassTakeoff": rowData.glassTakeoff,
            "panelFabs": rowData.panelFabs,
            "shopUseBrakeShapesAndSteel": rowData.shopUseBrakeShapesAndSteel,
            "fabDrawings": rowData.fabDrawings
        };

        if (!dateMapping[type] && !dateMapping[type].value) {
            return null;
        }

        const value = dateMapping[type].value;

        let result = dates.find((item: any) => item.Job_Number === rowData.jobNumber.value);
        let color = "#009E60";

        if (result && result[typeMapping[type]]) {
            let date = result[typeMapping[type]];

            let dateArr = date.split(" ");
            if (dateArr.length > 1) {
                date = dateArr[1];
                let date1 = new Date(date);
                date1.setHours(0, 0, 0, 0);
                let date2 = new Date(value);
                date2.setHours(0, 0, 0, 0);
                if (date1.getTime() === date2.getTime()) {
                    date = null;
                } else if (date1 > date2) {
                    color = "red";
                }
            } else {
                date = null;
            }

            return (
                <div>
                    <div>{value && new Date(value).toLocaleDateString()}</div>
                    <div style={{ color: color }}>{date}</div>
                </div>
            )
        } else {
            return <div>{value && new Date(value).toLocaleDateString()}</div>;
        }
    }

    const onChangeDateButtonClicked = () => {

        currCategoryData.forEach(job => {

            const dateMapping: any = {
                "metalTakeoff": job.metalTakeoff.value,
                "fieldStart": job.fieldStart.value,
                "shopStart": job.start.value,
                "doorSchedule": job.doorSchedule.value,
                "glassTakeoff": job.glassTakeoff.value,
                "panelFabs": job.panelFabs.value,
                "shopUseBrakeShapesAndSteel": job.shopUseBrakeShapesAndSteel.value,
                "fabDrawings": job.fabDrawings.value
            };

            Object.keys(dateMapping).forEach(key => {
                let date = dateMapping[key];
                if (date) {
                    date = new Date(date).toJSON();
                    console.log(date)
                    
                    // TO DO: Uncomment when done with project
                    // axios
                    //     .put(
                    //         `http://wwweb/portal/DesktopModules/ww_Global/API/PTSchedule/PutBaseline?Job_Number=${job.jobNumber}&Activity=${key}&Date=${date}`
                    //     )
                    //     .catch((error) => console.log(error));
                }
            })
        })
    };

    const tabColumns = [
        {
            dataField: "jobNumber",
            dataType: "string",
            caption: "Job Number",
            alignment: "center",
            canEdit: false,
        },
        {
            dataField: "jobName",
            dataType: "string",
            caption: "Job Name",
            alignment: "left",
            canEdit: false,
        },
        {
            dataField: "PM",
            dataType: "string",
            caption: "PM",
            alignment: "center",
            minWidth: 200,
            canEdit: true
        },
        {
            dataField: "superindentent",
            dataType: "string",
            caption: "Superintendent",
            alignment: "center",
            minWidth: 200,
            canEdit: true
        },
        {
            dataField: "startShopDrawings",
            dataType: "date",
            caption: "Start Shop Drawings",
            alignment: "center",
            canEdit: false,
            cellRender: (row: any) => {
                let dates = shopDrawings
                    .filter((task: any) => task.jobNumber === row.data.jobNumber.value)
                    .sort((a: any, b: any) => {
                        const startA = new Date(a.startDate).getTime();
                        const startB = new Date(b.startDate).getTime();
                        return startA - startB;
                    })
                row.data.shopDrawings = {}
                row.data.shopDrawings.value = dates.length > 0 ? new Date(dates[0].startDate) : null;
                return row.data.shopDrawings.value ? row.data.shopDrawings.value.toLocaleDateString() : "";
            }
        },
        {
            dataField: "metalTakeoff",
            caption: "Start Metal and Misc Takeoff",
            alignment: "center",
            canEdit: false,
            cellRender: (e: any) => renderDateCell(e.data, "metalTakeoff"),
        },
        {
            dataField: "glassTakeoff",
            dataType: "date",
            caption: "Start Glass Takeoff",
            alignment: "center",
            canEdit: false,
            cellRender: (e: any) => renderDateCell(e.data, "glassTakeoff"),
        },
        {
            dataField: "doorSchedule",
            dataType: "date",
            caption: "Start Door Schedule",
            alignment: "center",
            canEdit: false,
            cellRender: (e: any) => renderDateCell(e.data, "doorSchedule"),
        },
        {
            dataField: "shopUseBrakeShapesAndSteel",
            dataType: "date",
            caption: "Start Shop Use Brake Shapes",
            alignment: "center",
            canEdit: false,
            cellRender: (e: any) => renderDateCell(e.data, "shopUseBrakeShapesAndSteel"),
        },
        {
            dataField: "panelFabs",
            dataType: "date",
            caption: "Panel Fabs",
            alignment: "center",
            canEdit: false,
            cellRender: (e: any) => renderDateCell(e.data, "panelFabs"),
        },
        {
            dataField: "panelRelease",
            dataType: "date",
            caption: "Panel Release",
            alignment: "center",
            canEdit: false,
        },
        {
            dataField: "fabDrawings",
            dataType: "date",
            caption: "Fab Drawings",
            alignment: "center",
            canEdit: false,
            calculateCellValue: (row: any) => {
                let dates = fabMatrixs
                    .filter((task: any) => task.jobNumber === row.jobNumber.value)
                    .sort((a: any, b: any) => {
                        const startA = new Date(a.startDate).getTime();
                        const startB = new Date(b.startDate).getTime();
                        return startA - startB;
                    })
                row.fabDrawings = {}
                row.fabDrawings.value = dates.length > 0 ? new Date(dates[0].startDate) : null;
            },
            cellRender: (e: any) => renderDateCell(e.data, "fabDrawings"),
        },
        {
            dataField: "start",
            dataType: "date",
            caption: "Shop Start",
            alignment: "center",
            canEdit: false,
            cellRender: (e: any) => renderDateCell(e.data, "shopStart"),
        },
        {
            dataField: "fieldStart",
            dataType: "date",
            caption: "Field Start",
            alignment: "center",
            canEdit: false,
            cellRender: (e: any) => renderDateCell(e.data, "fieldStart"),
        },
    ]

    return (
        <div>
            <Button
                variant="contained"
                style={{ marginBottom: "20px" }}
                onClick={onChangeDateButtonClicked}
            >
                Update Dates
            </Button>
            <CustomView
                jobs={jobs}
                data={currCategoryData}
                tabColumns={tabColumns}
                categoryKey={categoryKey}
                colorOptions={settings}

                handleUpdate={handleUpdate}
                handleAdd={handleAdd}
                handleDelete={handleDelete}
                canEdit={canEdit}
            />
        </div>
    )
}

export async function getStaticProps() {
    // const loadedJobs = await loadData("/GetJobs");
    // const loadedTasks = await loadData("/GetTasks");
    const dates = await loadAllActivitiesDates();

    // let loadedSettings = await loadData("/GetSettings");
    // loadedSettings = loadedSettings.filter((setting: any) => setting.category === categoryKey)

    let loadedJobs = await loadData("/GetJobs");
    if (loadedJobs) {
        loadedJobs = Object.entries(loadedJobs).map((item: any) => {
            return {
                ...item[1],
                ID: item[0],
            }
        })
    }

    let loadedTasks = await loadData("/GetTasks");
    if (loadedTasks) {
        loadedTasks = Object.entries(loadedTasks).map((item: any) => {
            return {
                ...item[1],
                ID: item[0],
            }
        })

        loadedTasks = loadedTasks
            .filter((task: any) => task.category === categoryKey)
            .map((task: any) => addJSONData(task))
    }

    let loadedSettings = await loadData("/GetSettings");
    if (loadedSettings) {
        loadedSettings = Object.entries(loadedSettings).map((item: any) => {
            return {
                ...item[1],
                ID: item[0],
            }
        })

        loadedSettings = loadedSettings
            .filter((setting: any) => setting.category === categoryKey || setting.category === "shops")
            .map((setting: any) => addJSONData(setting))
    }


    return {
        props: {
            loadedJobs,
            loadedTasks,
            loadedSettings,
            dates
        }
    }
}