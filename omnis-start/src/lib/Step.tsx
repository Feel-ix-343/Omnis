import { Database } from "../../../supabase/database.types";

export class Step {
  constructor (
    public step: Database["public"]['Tables']['steps']['Row'] // TODO: update this to the query return type
  ) {}
}
