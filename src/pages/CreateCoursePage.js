import React, { useState, useContext, useReducer } from 'react'
import { Button, makeStyles, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Switch, Box } from '@material-ui/core'
import axios from 'axios'
import { API_URL } from '../environment'
import { useNotification } from '../hooks/notify'
import { AuthContext } from '../providers/AuthProvider'
import ProgressBar from './ProgressBar'

const useStyles = makeStyles(() => ({
    preview: {
        height: "12rem"
    },
    content: {
        height: "12rem"
    },
    content: {
        width: "100%",
        height: "12rem"
    },
    paper: {
        minWidth: 600
    }
}))

export default function CreateCourseModal({open, setOpen}) {
    const classes = useStyles()
    const [courseForm, setCourseForm] = useReducer((course, newData) => ({...course, ...newData}), {
        title: "",
        description: "",
        topic: "",
        preview: "",
        content: ""
    })
    const notify = useNotification()
    const [isContentUrl, setIsContentUrl] = useState(true)
    const { getTokens } = useContext(AuthContext)
    const [previewData, setPreviewData] = useReducer((previewData, newData) => ({...previewData, ...newData}), {
        url: "",
        uploadProgress: 0
    })
    const [contentData, setContentData] = useState([])

    const handleCreate = async () => {
        if(courseForm.title && courseForm.description && courseForm.content){
            try {
                await axios.post(
                    `${API_URL}/courses`,
                    courseForm
                )
                notify("Course created!", "success")
                resetForm()
                setOpen(false)
            } catch (error) {
                console.error(error)
                notify("There was an error", "error")
            }
        }
    }

    const handleClose = () => {
        resetForm()
        setOpen(false)
    }

    const resetForm = () => {
        setCourseForm({
            title: "",
            description: "",
            topic: "",
            preview: "",
            content: ""
        })
        setIsContentUrl(true)
        setPreviewData({})
    }

    const handleTextField = (event) => {
        setCourseForm({
            [event.target.id]: event.target.value
        })
    }

    const uploadFileToS3 = async (file) => {
        // Upload File
        const extension = file.name.split(".").pop()
        let formData = new FormData();
        formData.append("file", file);
        const putSignedUrl = await axios.get(`${API_URL}/assets/upload?filename=${file.name}&extension=${extension}`, formData)
        const awsUploadUrl = putSignedUrl.data
        const config = {
            onUploadProgress: progressEvent => setPreviewData({ uploadProgress: (progressEvent.loaded * 100 / file.size).toFixed(2) })
        }
        const awsResponse = await axios.put(awsUploadUrl, file, config)
        
        // Get File
        const getSignedUrl = await axios.get(`${API_URL}/assets/download?filename=${file.name}`)
        const awsFileUrl = getSignedUrl.data
        setPreviewData({ url: awsFileUrl })
    }

    const handlePreview = (event) => {
        const file = event.target.files[0]
        if(file){
            uploadFileToS3(file)
        }
    }

    const handleContent = (event) => {
        if(isContentUrl){
            const video = event.target.value
            if(video.match("youtube.com")){
                const videoId = youtube_parser(video)
                setCourseForm({ content: `https://www.youtube.com/embed/${videoId}` })
            }
        }
        else {
            const file = event.target.files[0]
            if(file){
                uploadFileToS3(file)
            }
        }
    }

    function youtube_parser(url){
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11)? match[7] : false;
    }

    return (
        <Dialog open={open} onClose={handleClose} classes={{paperWidthSm: classes.paper}} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Course</DialogTitle>
            <DialogContent dividers>
                <TextField
                    autoFocus
                    margin="dense"
                    id="title"
                    label="Title"
                    type="text"
                    fullWidth
                    inputProps={{ maxLength: 50 }}
                    onChange={handleTextField}
                    required
                />
                <TextField
                    autoFocus
                    margin="dense"
                    id="description"
                    label="Description"
                    type="text"
                    multiline
                    fullWidth
                    inputProps={{ maxLength: 256 }}
                    onChange={handleTextField}
                    required
                />
                <TextField
                    autoFocus
                    margin="dense"
                    id="topic"
                    label="Topic"
                    type="text"
                    multiline
                    fullWidth
                    inputProps={{ maxLength: 30 }}
                    onChange={handleTextField}
                    required
                />
                <TextField
                    autoFocus
                    margin="dense"
                    id="preview"
                    label="Preview"
                    type="file"
                    accept="image/*"
                    autoComplete="off"
                    tabIndex="-1"
                    onChange={handlePreview}
                    fullWidth
                    required
                />
                {previewData.url && <img alt="preview" className={classes.preview} src={`${previewData.url}`}></img>}
                {previewData.uploadProgress !== 0 && <ProgressBar progress={previewData.uploadProgress}></ProgressBar>}
                <Box display="flex" alignItems="center">
                    {
                        isContentUrl ?
                            <TextField
                                autoFocus
                                margin="dense"
                                id="content"
                                label="Content"
                                type="text"
                                placeholder="Youtube video"
                                onChange={handleContent}
                                fullWidth
                                required
                            /> : 
                        <>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="content"
                            label="Content"
                            type="file"
                            accept="image/*"
                            autoComplete="off"
                            tabIndex="-1"
                            onChange={handleContent}
                            fullWidth
                            required
                        />
                        </>
                    }
                    <Switch
                        checked={isContentUrl}
                        onChange={() => {
                            setIsContentUrl(!isContentUrl)
                            setCourseForm({content: ""})
                        }}
                        name="contentSwitch"
                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                    />
                </Box>
                {courseForm.content && courseForm.content.startsWith("data:image") && !isContentUrl && <img alt="content" className={classes.content} src={`${courseForm.content}`}></img>}
                {courseForm.content && courseForm.content.startsWith("data:video") && !isContentUrl && <video alt="content" className={classes.contentVideo} src={`${courseForm.content}`} controls></video>}
                {courseForm.content && isContentUrl && <iframe title="Content" className={classes.content} src={`${courseForm.content}`}></iframe>}
                {/*uploadProgress !== 0 && <ProgressBar progress={uploadProgress}></ProgressBar>*/}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleCreate} color="primary">
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    )
}