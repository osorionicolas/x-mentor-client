import React, { useEffect, useState, useContext, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useParams } from "react-router-dom"
import axios from 'axios'
import { API_URL } from '../environment'
import { Grid, Typography } from '@material-ui/core'
import { useNotification } from '../hooks/notify'
import { AuthContext } from '../providers/AuthProvider'
import Rating from '@material-ui/lab/Rating'

const styles = makeStyles(() => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    contentContainer: {
        height: "30rem",
        textAlign: "center",
        background: "gray",
    },
    content: {
        height: "100%",
        width: "100%"
    },
    title: {
        padding: "1rem 5rem"
    },
    about: {
        padding: "2rem 5rem"
    }
}))

const CoursePage = () => {
    const classes = styles()
    const { id } = useParams()
    const notify = useNotification()
    const { isLoggedIn } = useContext(AuthContext)
    const [course, setCourse] = useState({})
    const startTime = useRef(0)

    const fetchData = async () => {
        const response = await axios(
            `${API_URL}/courses/${id}`
        ).catch(error => {
            console.error(error)
            notify("There was an error retreiving the course", "error")
        })
        setCourse(response.data)

    }

    const Content = () => {
        if(course.content){
            if(course.content.url.startsWith("data:image")) return <img alt="content" className={classes.content} src={`${course.content.url}`}></img>
            else if(course.content.url.startsWith("data:video")) return <video alt="content" className={classes.content} src={`${course.content.url}`} controls></video>
            else return <iframe title="Content" className={classes.content} src={`${course.content.url}`}></iframe>
        }
        else{
            return <img alt="preview" className={classes.content} src={`${course.preview}`}></img>
        }
    }
    
    const updateWatchTime = async (seconds) => {
        if(isLoggedIn){
            await axios.post(
                `${API_URL}/users/progress`,
                { "duration_in_seconds": seconds }
            ).catch(error => console.log(error))
        }
    }

    const rate = async (event) => {
        const value = event.target.value
        await axios.post(
            `${API_URL}/courses/rate `,
            { course: course.title, stars: value }
        ).catch(error => {
            notify("You have already rated the course!", "error")
        })
        notify("Rated successfully", "success")
    }

    useEffect(() => {
        fetchData()
        startTime.current = new Date().getTime()
        return () => {
            const seconds = Math.round((new Date().getTime() - startTime.current) / 1000)
            updateWatchTime(seconds)
        }
    }, [])
    
    return (
        <div className={classes.root}>
            <Typography variant="h5" className={classes.title}><strong>{course.title}</strong></Typography>
            <Grid container>
                <Grid item xs={2}></Grid>
                <Grid item xs={8} className={classes.contentContainer}>
                    <Content />
                </Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={8} className={classes.about}>
                    <Typography variant="h6"><strong>About</strong></Typography>
                    <Typography>{course.description}</Typography>
                </Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={2}></Grid>
                <Grid container item xs={8} className={classes.rating} justify="space-evenly" alignItems="center">
                    <Typography variant="h6"><strong>Rate the course</strong></Typography>
                    <Rating name="rating" defaultValue={0} onChange={rate} size="large"/>
                </Grid>
            </Grid>
        </div>
    )
}

export default CoursePage