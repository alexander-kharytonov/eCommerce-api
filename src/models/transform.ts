import type { HydratedDocument, ToObjectOptions } from "mongoose";

type SerializableDocument = Record<string, unknown> & {
  _id?: unknown;
  __v?: unknown;
  password?: unknown;
};

export const responseTransform: NonNullable<ToObjectOptions["transform"]> = (
  _document: HydratedDocument<unknown>,
  returnedObject: SerializableDocument,
) => {
  if (returnedObject._id !== undefined) {
    returnedObject.id = String(returnedObject._id);
  }

  delete returnedObject._id;
  delete returnedObject.__v;
  delete returnedObject.password;

  return returnedObject;
};

export const responseOptions = {
  virtuals: false,
  versionKey: false,
  transform: responseTransform,
} satisfies ToObjectOptions;
