import React, { useState, useEffect } from "react";
import {
    loadData,
    putData,
    postData,
    deleteData,
    updateJSONWithData,
    addJSONData,
    addDataToJSON,
    deconstructJobData,
    createCategoryData
} from "@/lib/helper-functions";

import CustomView from "@/src/components/Views/CustomView";

const categoryKey = "purchasing";
const jobsKey = "production-schedule";

export default function PurchasingPage(props: any) {
    const {
        loadedJobs,
        loadedSettings
    } = props;

    const [canEdit, setCanEdit] = useState(true);

    const [jobs, setJobs] = useState(deconstructJobData(loadedJobs, categoryKey));
    const [shops, setShops] = useState(loadedSettings.filter((setting: any) => setting.category === "shops"))
    const [settings, setSettings] = useState(loadedSettings.filter((setting: any) => setting.category === categoryKey));

    const [currCategoryData, setCurrCategoryData] = useState([]);

    useEffect(() => {
        let newCategoryData = createCategoryData(jobs, categoryKey, tabColumns);
        setCurrCategoryData(newCategoryData);
    }, [jobs])

    const jobWallCell = (row: any) => {
        return (
            <div style={{ textAlign: "left" }}>
                <span>{row.data.jobName.value}</span>
            </div>
        );
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
            visibleIndex: 0,
            alignment: "center",
            allowSorting: true,
            canEdit: false,
        },
        {
            dataField: "jobName",
            caption: "Job Name & Wall Type",
            visibleIndex: 1,
            alignment: "left",
            canEdit: false,
            minWidth: 200,
            cellRender: jobWallCell
        },
        {
            dataField: "shopStart",
            caption: "Shop Start Date",
            visibleIndex: 2,
            alignment: "center",
            defaultSortOrder: "asc",
            allowSorting: true,
            canEdit: false,
            dataType: "date"
        },
        {
            dataField: "fieldStart",
            caption: "Field Start",
            visibleIndex: 3,
            dataType: "date",
            canEdit: false,
            alignment: "center",
        },
        {
            dataField: "shop",
            caption: "Shop",
            visibleIndex: 4,
            alignment: "center",
            canEdit: false,
            cellRender: (cell: any) => {
                const foundShop = shops.find((shop: any) => shop.ID === cell.data.shopID);
                return foundShop ? foundShop.value : "";
            }
        },
        {
            visibleIndex: 5,
            dataField: "hiltiEmbeds",
            caption: "Hilti Embeds",
            dataType: "string",
            canEdit: true
        },
        {
            visibleIndex: 6,
            dataField: "MAC",
            caption: "MAC",
            dataType: "string",
            canEdit: true
        },
        {
            visibleIndex: 7,
            dataField: "metalBooking",
            caption: "Metal Booking",
            dataType: "string",
            canEdit: true
        },
        {
            visibleIndex: 8,
            dataField: "glassBooking",
            caption: "Glass Booking",
            dataType: "string",
            canEdit: true
        },
        {
            visibleIndex: 9,
            caption: "Production Line Sample Approval",
            columns: [
                {
                    visibleIndex: 0,
                    dataField: "western",
                    caption: "Western",
                    dataType: "string",
                    canEdit: true
                },
                {
                    visibleIndex: 1,
                    dataField: "certified",
                    caption: "Certified",
                    dataType: "string",
                    canEdit: true
                },
                {
                    visibleIndex: 2,
                    dataField: "composite",
                    caption: "Composite",
                    dataType: "string",
                    canEdit: true
                },
            ]
        },
        {
            visibleIndex: 10,
            caption: "Dow",
            columns: [
                {
                    visibleIndex: 0,
                    dataField: "review",
                    caption: "Review",
                    dataType: "string",
                    canEdit: true
                },
                {
                    visibleIndex: 1,
                    dataField: "glass",
                    caption: "Glass",
                    dataType: "string",
                    canEdit: true
                },
                {
                    visibleIndex: 2,
                    dataField: "metal",
                    caption: "Metal",
                    dataType: "string",
                    canEdit: true
                },
                {
                    visibleIndex: 3,
                    dataField: "panel",
                    caption: "Panel",
                    dataType: "string",
                    alignment: "center",
                    canEdit: true
                },
                {
                    visibleIndex: 4,
                    dataField: "gasket",
                    caption: "Gasket",
                    dataType: "string",
                    alignment: "center",
                    canEdit: true
                },
            ]
        },
        {
            visibleIndex: 6,
            dataField: "shopSealant",
            caption: "Shop Sealant",
            dataType: "string",
            canEdit: true
        },
        {
            visibleIndex: 7,
            dataField: "boltTesting",
            caption: "Bolt Testing",
            dataType: "string",
            canEdit: true
        },
        {
            visibleIndex: 8,
            caption: "Doors",
            columns: [
                {
                    visibleIndex: 0,
                    dataField: "orderHardware",
                    caption: "Order Hardware",
                    dataType: "string",
                    canEdit: true
                },
                {
                    visibleIndex: 1,
                    dataField: "doorPaint",
                    caption: "Door Paint",
                    dataType: "string",
                    canEdit: true
                },
                {
                    visibleIndex: 3,
                    dataField: "threeWeekUpdate",
                    caption: "3 Week Update and PM/Shop Notification",
                    dataType: "string",
                    canEdit: true
                }
            ]
        },
        {
            visibleIndex: 9,
            dataField: "fieldUseReport3Updates",
            caption: "Field Use Report 3 Updates (2 weeks prior to due date.  Due 8 weeks prior to field start date.)",
            dataType: "string",
            canEdit: true
        }
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

export async function getStaticProps() {
    // const loadedJobs = await loadData("/GetJobs");
    // const settings = await loadData("/GetSettings");
    // const loadedSettings = settings.filter((setting: any) => setting.category === categoryKey)

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