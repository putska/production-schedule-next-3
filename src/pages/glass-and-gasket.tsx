import React, { useState, useEffect } from "react";
import {
    loadData,
    putData,
    postData,
    deleteData,
    updateDataWithJSON,
    updateJSONWithData,
    addJSONData,
    addDataToJSON
} from "@/lib/helper-functions";

import CustomView from "@/src/components/Views/CustomView";

const categoryKey = "glass-and-gasket";
const jobsKey = "production-schedule";

export default function PurchasingPage(props: any) {
    const {
        loadedJobs,
        loadedSettings
    } = props;

    const [canEdit, setCanEdit] = useState(true);

    const [jobs, setJobs] = useState(loadedJobs);
    const [shops, setShops] = useState(loadedSettings.filter((setting:any) => setting.category === "shops"))
    const [settings, setSettings] = useState(loadedSettings.filter((setting:any) => setting.category === categoryKey));

    const [currCategoryData, setCurrCategoryData] = useState([]);

    useEffect(() => {
        let newJobs = jobs.map((job: any) => ({ ...job, JSON: typeof job.JSON === "string" ? JSON.parse(job.JSON) : { ...job.JSON } }))
        newJobs = convertDates(newJobs);
        const newCategoryData = newJobs.map((job: any) => {

            let newJobData: any = { ID: job.ID, shopID: job.shopID, JSON: job.JSON }

            tabColumns.forEach((col: any) => {
                if (col.columns) {
                    col.columns.forEach((subCol: any) => {
                        newJobData[subCol.dataField] = getDisplayUnits(job, subCol);
                    })
                } else {
                    newJobData[col.dataField] = getDisplayUnits(job, col);
                }
            })
            return newJobData;
        })
        setCurrCategoryData(newCategoryData);
    }, [jobs])

    const getDisplayUnits = (job: any, col: any) => {
        const categoryData = job.JSON[categoryKey] && job.JSON[categoryKey][col.dataField];
        const jobData = job.JSON[jobsKey] && job.JSON[jobsKey][col.dataField];

        let displayUnits = { value: "", status: "" }

        if (categoryData) {
            displayUnits.value = categoryData.value;
            displayUnits.status = categoryData.status;
        }
        if (jobData) {
            displayUnits.value = jobData;
        }
        return displayUnits;
    }

    const convertDates = (jobs: any) => {
        let dateFields = [
            "shopStart",
            "fieldStart",
            "metalTakeoff",
            "orderWeekOf",
            "panelFabs",
            "panelRelease",
            "glassTakeoff",
            "shopUseBrakeShapesAndSteel",
            "doorSchedule"
        ];

        let updatedJobs = JSON.parse(JSON.stringify(jobs));
        updatedJobs.forEach((job: any) => {
            dateFields.forEach((field) => {
                job.JSON[jobsKey][field] = job.JSON[jobsKey][field] ? new Date(job.JSON[jobsKey][field]) : new Date();
            });
        });

        updatedJobs.sort(function (a: any, b: any) {
            return a.JSON[jobsKey].shopStart.getTime() - b.JSON[jobsKey].shopStart.getTime();
        });

        return updatedJobs;
    }

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
            dataField: "orderLinkToShop",
            caption: "Link To Shop Start?",
            dataType: "boolean",
            canEdit: false,
        },
        {
            dataField: "orderWeekOf",
            dataType: "date",
            caption: "Order Week Of",
            alignment: "center",
            minWidth: 160,
            canEdit: true,
            // cellRender: orderWeekRender,
            // editCellRender: orderWeekEdit,
        },
        {
            dataField: "glassRequired",
            dataType: "date",
            caption: "Glass Required",
            alignment: "center",
            canEdit: false,
            // cellRender: (row: any) => {
            //     let date = new Date(row.data.start.value);
            //     date.setDate(date.getDate() - 14);
            //     return date;
            // },
        },
        {
            dataField: "numberOfLites",
            caption: "# Of Lites",
            alignment: "center",
            canEdit: true,
        },
        {
            dataField: "sqft",
            caption: "Square Footage",
            alignment: "center",
            canEdit: true,
        },
        {
            dataField: "vendor",
            dataType: "string",
            caption: "Vendor",
            alignment: "center",
            canEdit: true,
        },
        {
            dataField: "lbs",
            dataType: "number",
            caption: "Lbs, K",
            alignment: "center",
            canEdit: true,
        },
        {
            dataField: "gasket",
            caption: "Gasket",
            alignment: "center",
            canEdit: false,
        },
        {
            dataField: "coating",
            dataType: "string",
            caption: "Coating",
            alignment: "center",
            canEdit: true,
        },
        {
            dataField: "pgtTransferred",
            dataType: "boolean",
            caption: "PGT Transferred",
            alignment: "center",
            canEdit: false
        },
        {
            dataField: "bookingPO",
            dataType: "string",
            caption: "Booking PO",
            alignment: "center",
            canEdit: true,
        },
        {
            dataField: "pgtComplete",
            dataType: "string",
            caption: "PGT Complete",
            alignment: "center",
            canEdit: true,
        },
    ]

    return (
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
    )
}

export async function getServerSideProps() {
    // const loadedJobs = await loadData("/GetJobs");
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
            loadedSettings
        }
    }
}