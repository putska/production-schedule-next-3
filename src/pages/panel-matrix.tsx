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

import Checkbox from '@mui/material/Checkbox';

import CustomView from "@/src/components/Views/CustomView";

const categoryKey = "panel-matrix";
const jobsKey = "production-schedule"

export default function PanelMatrixPage(props: any) {
    const {
        loadedJobs,
        loadedSettings
    } = props;

    const [canEdit, setCanEdit] = useState(true);

    const [jobs, setJobs] = useState(loadedJobs);
    const [shops, setShops] = useState(loadedSettings.filter((setting:any) => setting.category === "shops"))
    const [settings, setSettings] = useState(loadedSettings.filter((setting:any) => setting.category === categoryKey));

    const [currCategoryData, setCurrCategoryData] = useState([]);
    const [colorOptions, setColorOptions] = useState([]);

    useEffect(() => {
        const newColorOptions = addJSONData(settings);
        setColorOptions(newColorOptions);
    }, [settings])

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
            dataField: 'linkToField',
            caption: 'Link to Field Start',
            dataType: 'boolean',
            canEdit: true
        },
        {
            dataField: 'jobNumber',
            dataType: 'string',
            caption: 'Job Number',
            alignment: 'center',
            canEdit: true,
        },
        {
            dataField: 'jobName',
            dataType: 'string',
            caption: 'Job Name',
            alignment: 'left',
            canEdit: true,
        },
        {
            dataField: 'shopStart',
            dataType: 'date',
            caption: 'Shop Start',
            alignment: 'center',
            canEdit: true,
        },
        {
            dataField: 'fieldStart',
            dataType: 'date',
            caption: 'Field Start',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'panelFabs',
            dataType: 'date',
            caption: 'Panel Fabs',
            minWidth: 160,
            alignment: 'center',
            canEdit: true
            //   cellRender: panelFabsRender,
            //   editCellRender: panelFabsEdit,
        },
        {
            dataField: 'panelRelease',
            dataType: 'date',
            caption: 'Panel Release',
            alignment: 'center',
            minWidth: 160,
            canEdit: true
            //   cellRender: panelReleaseRender,
            //   editCellRender: panelReleaseEdit,
        },
        {
            dataField: 'dollarAmount',
            dataType: 'number',
            caption: 'Dollar Amount',
            alignment: 'center',
            canEdit: true,
            cellRender: (cell: any) => (cell.data.dollarAmount?.value ? `$ ${cell.data.dollarAmount.value}` : ""),
        },
        {
            dataField: 'sqft',
            dataType: 'number',
            caption: 'Sq. Ft.',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'pnl_vendor',
            dataType: 'string',
            caption: 'Vendor',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'costPerSqft',
            dataType: 'number',
            caption: '$ per Sq. Ft.',
            alignment: 'center',
            canEdit: true,
            cellRender: (row: any) => {
                return (row.data.dollarAmount?.value && row.data.sqft?.value) ? `$ ${(row.data.dollarAmount?.value / row.data.sqft?.value).toFixed(2)}` : "";
            }
        },
        {
            dataField: 'panelRFQ',
            caption: 'Panel RFQ',
            dataType: 'boolean',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'proposedPanelReleases',
            dataType: 'number',
            caption: 'Proposed Panel Releases (from Sherwin)',
            alignment: 'center',
            headerColor: " #1976d2",
            canEdit: true
        },
        {
            dataField: 'panelScope',
            caption: 'Panel Scope',
            alignment: 'center',
            headerColor: " #1976d2",
            canEdit: true
        },
        {
            dataField: 'vendorKickOffLetter',
            dataType: 'string',
            caption: 'Vendor Kick-Off Letter',
            alignment: 'center',
            headerColor: " #1976d2",
            canEdit: true
        },
        {
            dataField: 'kickOffMeeting',
            dataType: 'string',
            caption: 'PM/Vendor Kick-Off Meeting',
            alignment: 'center',
            headerColor: " #1976d2",
            canEdit: true
        },
        {
            dataField: 'finalPanelReleases',
            dataType: 'number',
            caption: 'Final Panel Releases',
            alignment: 'center',
            headerColor: " #1976d2",
            canEdit: true
        },
        {
            dataField: 'keyNotes',
            dataType: 'string',
            caption: 'Key Notes for Scope',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'finish',
            dataType: 'string',
            caption: 'Finish',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'certifiedMatchApproved',
            dataType: 'boolean',
            caption: 'Certified Match Approved',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'warranty',
            dataType: 'string',
            caption: 'Warranty',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'deliveryStartDateShop',
            dataType: 'date',
            caption: 'Delivery Start Date Shop',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'deliveryStartDateField',
            dataType: 'date',
            caption: 'Delivery Start Date Field',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'shopUseBrakes',
            dataType: 'date',
            caption: 'Shop Use Brakes Shape Release',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'shopUseSteel',
            dataType: 'date',
            caption: 'Shop Use Steel Release',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'glazeInPanelRelease',
            dataType: 'date',
            caption: 'Glaze-In Panel Release',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'fieldUsePanelRelease',
            dataType: 'date',
            caption: 'Field Use Panel Release',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'QC',
            caption: 'QC',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'doorLeafs',
            dataType: 'number',
            caption: '# of Door Leafs',
            alignment: 'center',
            canEdit: true
        },
        {
            dataField: 'notes',
            dataType: 'string',
            caption: 'Notes',
            alignment: 'left',
            canEdit: true
        },
    ]

    return (
        <CustomView
            jobs={jobs}
            data={currCategoryData}
            tabColumns={tabColumns}
            categoryKey={categoryKey}
            colorOptions={colorOptions}

            handleUpdate={handleUpdate}
            handleAdd={handleAdd}
            handleDelete={handleDelete}
            canEdit={canEdit}
        />
    )
}

export async function getServerSideProps() {
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