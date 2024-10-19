import { TaskStatus } from "../enums/task-status"

export type TaskModel = {
    id: string,
    title: string,
    description: string,
    status: string
}