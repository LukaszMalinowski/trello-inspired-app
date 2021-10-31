import React, {useState} from 'react';
import {Grid, Typography} from "@mui/material";
import {mockedColumns} from "../data/mockedColumns";
import Column from "../components/Column/Column";
import {DragDropContext, Droppable} from "react-beautiful-dnd";
import {v4 as uuidv4} from 'uuid';
import DeleteIcon from "@mui/icons-material/Delete";
import {useHistory} from "react-router-dom";
import ConfirmDeleteBoardDialog from "../components/ConfirmDeleteBoardDialog/ConfirmDeleteBoardDialog";

const deleteIconStyle = {
    float: "right",
    cursor: "pointer",
    fontSize: 50
};

const BoardPage = ({boardId}) => {
    const [columns, setColumns] = useState(mockedColumns);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const history = useHistory();

    const toggleDeleteDialog = () => {
        setDeleteDialogOpen(!deleteDialogOpen);
    }

    const handleDroppingTask = result => {
        const {source, destination} = result;
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            changeOrderInSameColumn(source, destination);
        } else {
            changeColumn(source, destination);
        }

    }

    const changeOrderInSameColumn = (source, destination) => {
        //TODO: do this with call to backend also
        let sourceTasks = columns.find(column => column.columnId.toString() === destination.droppableId).tasks;
        const [removedTask] = sourceTasks.splice(source.index, 1);
        sourceTasks.splice(destination.index, 0, removedTask);
        setColumns(columns.map(column => column.columnId.toString() === destination.droppableId ? {
            ...column,
            tasks: sourceTasks
        } : column));
    }

    const changeColumn = (source, destination) => {
        //TODO: do this with call to backend also
        let sourceTasks = columns.find(column => column.columnId.toString() === source.droppableId).tasks;
        const [removedTask] = sourceTasks.splice(source.index, 1);

        let destinationTasks = columns.find(column => column.columnId.toString() === destination.droppableId).tasks;
        destinationTasks.splice(destination.index, 0, removedTask);

        const editedColumns = columns
            .map(column => column.columnId.toString() === source.droppableId ?
                {
                    ...column,
                    tasks: sourceTasks
                }
                :
                column)
            .map(column => column.columnId.toString() === destination.droppableId ?
                {
                    ...column,
                    tasks: destinationTasks
                }
                :
                column)
        setColumns(editedColumns);
    }


    const editTask = (editedTask, columnId) => {
        //TODO: add integration with database
        let tasks = columns.find(column => column.columnId === columnId).tasks;
        const editedTasks = tasks.map(task => task.taskId === editedTask.taskId ? editedTask : task);
        setColumns(columns.map(column => column.columnId === columnId ? {...column, tasks: editedTasks} : column))
    }

    const deleteTask = (taskId, columnId) => {
        let tasks = columns.find(column => column.columnId === columnId).tasks;
        tasks = tasks.filter(task => task.taskId !== taskId);
        setColumns(columns.map(column => column.columnId === columnId ? {...column, tasks} : column));
    }

    const addNewTask = (title, description, columnId) => {
        let tasks = columns.find(column => column.columnId === columnId).tasks;
        const newTask = {
            taskId: uuidv4(),
            title: title,
            description: description
        };
        tasks = [...tasks, newTask];
        setColumns(columns.map(column => column.columnId === columnId ? {...column, tasks} : column))
    }

    const handleDeleteBoard = () => {
        history.push("/all-boards");
    }

    const columnItems = columns.map(column =>
        <Grid key={column.columnId}
              style={{marginLeft: 15}}
              item
              xs={8} md={4} xl={2}>
            <Droppable droppableId={column.columnId.toString()}>
                {provided => (
                    <Column {...column}
                            provided={provided}
                            editTask={editTask}
                            addNewTask={addNewTask}
                            deleteTask={deleteTask}/>
                )}
            </Droppable>
        </Grid>);

    return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <div>
                <Typography variant="h3" style={{height: '10%'}}>
                    Hello! You are on board with board id {boardId}
                </Typography>
                <DeleteIcon style={deleteIconStyle} onClick={toggleDeleteDialog}/>
            </div>
            <DragDropContext onDragEnd={handleDroppingTask}>
                <Grid container style={{flexGrow: 1}} wrap="nowrap">
                    {columnItems}
                </Grid>
            </DragDropContext>
            <ConfirmDeleteBoardDialog
                open={deleteDialogOpen}
                deleteBoard={handleDeleteBoard}
                toggleDialog={toggleDeleteDialog}
                boardId={boardId}
            />
        </div>
    );
};

export default BoardPage;