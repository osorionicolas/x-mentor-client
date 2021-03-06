import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@material-ui/core'
import axios from 'axios'
import Pagination from '@material-ui/lab/Pagination'
import { API_URL } from '../environment'
import { useHistory } from "react-router-dom";
import { useNotification } from '../hooks/notify'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: `${theme.spacing(8)}px ${theme.spacing(18)}px`,
  },
  grid: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.paper,
  },
  media: {
    height: 165,
    padding: "45px 0",
    margin: "20px 0 0",
    backgroundSize: "auto 100%"
  },
  tile: {
    padding: theme.spacing(5),
    width: "30%"
  },
  description: {
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    display: '-webkit-box'
  },
  cardActions: {
    '&:hover': {
    }
  },
  title: {
    fontWeight: 'bold'
  },
  pagination: {
    '& > *': {
      marginTop: theme.spacing(2),
    },
  },
}))

export default function CourseListPage() {
  const classes = useStyles()
  const history = useHistory()
  const [courses, setCourses] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(10)
  const notify = useNotification()

  const handleChange = (event, value) => setPage(value)

  const fetchData = async () => {
    const response = await axios(
      `${API_URL}/users/courses?page=${page}`
    ).catch(error => {
      const status = error.response && error.response.status
      if(status === 401) {
        notify("Session Expired", "warning")
        localStorage.removeItem("token")
        history.push("/")
      }
      else {
        notify("There was an error retreiving courses", "error")
      }
    })
    setCourses(response.data)
    setTotal(Math.ceil(response.data.total / 6))
  }

  const watchCourse = (courseId) => {
    history.push(`/course/${courseId}`)
  }
  
  useEffect(() => {
    fetchData()
  }, [page])

  return (
    <div className={classes.root}>
      {courses?.length > 0 ?
      <>
      <div className={classes.pagination}>
        <Pagination count={total} shape="rounded" onChange={handleChange} />
      </div>
      <Grid container classes={{ root: classes.grid }}>
        {courses.map((course) => (
          <Grid item className={classes.tile} key={course.uuid}>
            <Card id={course.uuid}>
              <CardActionArea onClick={() => watchCourse(course.uuid)}>
                <CardContent className={classes.content}>
                  <Typography gutterBottom variant="h6" className={classes.title}>
                    {course.title}
                  </Typography>
                  <CardMedia
                    className={classes.media}
                    image={course.preview}
                    title={course.title}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      </>
    : <Grid container item classes={{ root: classes.grid }}>
        <Typography gutterBottom variant="h6" className={classes.title}>
          We couldn't find any courses with the specified filter
        </Typography>
      </Grid>
    }
  </div>
  )
}