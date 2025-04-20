import { z } from "zod";

export type FieldType = {
  label: string;
  name: string;
  placeholder: string;
  type?:
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "date"
    | "password"
    | "file"
    | "dropdown"
    | "hidden"
    | "geolocalization";
  accept?: string;
  values?: Array<string>;
  max?: number,
  min?: number,
};

export type DynamicFormProps<T extends z.ZodTypeAny> = {
  formType?: string; 
  schema: T;
  fields: FieldType[];
  values?: Array<string>;
  max?: number,
  min?: number,
  onSubmit: (data: z.infer<T>) => Promise<void>;
};
