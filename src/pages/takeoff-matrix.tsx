import React, { useState, useEffect } from "react";

import VerticalWeeklyView from "@/src/components/Views/VerticalWeeklyView"
import {
    toMondayDate,
    addDays,
    toWeeks,
    createBasicRows,
    calculateWeeks,
    getHighlight,
    createRows,
    convertDates,
    loadData,
    putData,
    postData,
    deleteData,
    toDays,
    deconstructJobData
} from "@/lib/helper-functions";

const jobsKey = "production-schedule";

export default function TakeoffMatrixPage(props:any) {
    const { loadedJobs, loadedTakeoffMatrixs, dateRows, weeks } = props;

    const [canEdit, setCanEdit] = useState(true)
    const [takeoffData, setTakeoffData] = useState([]);
    const [hJobs, sethJobs] = useState([]);
    const [jobs, setJobs] = useState(deconstructJobData(loadedJobs, jobsKey));
    const [takeoffMatrixs, setTakeoffMatrixs] = useState(loadedTakeoffMatrixs);

    useEffect(() => {
        console.log(jobs)
        const newJobs = JSON.parse(JSON.stringify(jobs))
        const createdRows = createRows(takeoffMatrixs, dateRows, newJobs, weeks);
        setTakeoffData(createdRows);

        const tempJobs = convertDates(newJobs);

        sethJobs(tempJobs.filter((job: any) => {
            if (job.jobDatesUpdated) {
                const timeSinceChanged = toDays(job.jobDatesUpdated, new Date())
                return timeSinceChanged < 7;
            }
            return false;
        }))

    }, [jobs, takeoffMatrixs])

    async function handleUpdate(data: any, endpoint: any) {
        switch (endpoint) {
            case "takeoffMatrix":
                try {
                    const resData = await putData("/PutTakeoffMatrix", data);
                    setTakeoffMatrixs((prev: any) => {
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
            case "takeoffMatrix":
                try {
                    const resData = await postData("/PostTakeoffMatrix", data);
                    setTakeoffMatrixs((prev: any) => {
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
            case "takeoffMatrixs":
                try {
                    const resData = await deleteData("/DeleteTakeoffMatrix", data);
                    setTakeoffMatrixs((prev: any) => prev.filter((item: any) => item.ID !== data.ID));
                } catch (error) { console.log(error) }
                break;
            default:
                break;
        }
    }

    const tabColumns = [
        {
            dataField: "idsDrafting",
            caption: "ID's Drafting"
        }
    ]

    return (
        <VerticalWeeklyView
            takeoffMatrixs={takeoffMatrixs}
            takeoffData={takeoffData}
            handleUpdate={handleUpdate}
            handleAdd={handleAdd}
            handleDelete={handleDelete}
            rows={dateRows}
            weeks={weeks}
            createRows={createRows}
            toWeeks={toWeeks}
            toMondayDate={toMondayDate}
            addDays={addDays}
            canEdit={canEdit}
            highlightJobs={hJobs}
        />
    )
}

export async function getStaticProps() {

    // const loadedJobs = await loadData("/GetJobs");
    // const loadedTakeoffMatrixs = await loadData("/GetTakeoffMatrixs")

    let loadedJobs = await loadData("/GetJobs");
    loadedJobs = Object.entries(loadedJobs).map((item:any) => {
        return {
            ...item[1],
            ID: item[0],
        }
    })

    let loadedTakeoffMatrixs = await loadData("/GetTakeoffMatrixs");
    loadedTakeoffMatrixs = Object.entries(loadedTakeoffMatrixs).map((item:any) => {
        return {
            ...item[1],
            ID: item[0],
        }
    })

    const weeks = calculateWeeks(deconstructJobData(loadedJobs, jobsKey));
    const dateRows = createBasicRows(new Date(), weeks);

    return {
        props: {
            loadedJobs, 
            loadedTakeoffMatrixs,
            dateRows,
            weeks
        }
    }
}