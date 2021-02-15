// you can't use "enum" as a type, so use this.
type EnumType = { [s: number]: string };

// * https://stackoverflow.com/questions/41308123/map-typescript-enum
function mapEnum(enumerable: EnumType, fn: Function): any[] {
  // get all the members of the enum
  let enumMembers: any[] = Object.keys(enumerable).map(
    (key) => enumerable[key]
  );

  // we are only interested in the numeric identifiers as these represent the values
  let enumValues: number[] = enumMembers.filter((v) => typeof v === "number");

  // now map through the enum values
  return enumValues.map((m) => fn(m));
}

export { mapEnum };
