import { CreateJobDTO } from "./createJobDTO";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateJobDTO extends PartialType(CreateJobDTO) {}