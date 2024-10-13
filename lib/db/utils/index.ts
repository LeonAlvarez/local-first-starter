import { getTableColumns, Simplify, Table, TableConfig } from "drizzle-orm";
import { PgTableWithColumns, PgSelect } from "drizzle-orm/pg-core";
import { AnyColumn, Column, DriverValueDecoder, getTableName, is, SelectedFieldsOrdered, SQL } from "drizzle-orm";

export function mapJsonArray<T extends TableConfig, Q>(
  table: PgTableWithColumns<T>,
  rows: Q[]
): Simplify<PgSelect<T['name'], PgTableWithColumns<T>['_']['columns'], 'single'>['_']['result']> {
  return rows.map(row =>
    mapResultRow(orderSelectedFields(getTableColumns(table)), Object.values(row as any), undefined)
  )
}

// https://github.com/drizzle-team/drizzle-orm/blob/6974798737a2710a6dc6d37d772442d2c895c987/drizzle-orm/src/utils.ts#L73
export function orderSelectedFields<TColumn extends AnyColumn>(
	fields: Record<string, unknown>,
	pathPrefix?: string[],
): SelectedFieldsOrdered<TColumn> {
	return Object.entries(fields).reduce<SelectedFieldsOrdered<AnyColumn>>((result, [name, field]) => {
		if (typeof name !== 'string') {
			return result;
		}

		const newPath = pathPrefix ? [...pathPrefix, name] : [name];
		if (is(field, Column) || is(field, SQL) || is(field, SQL.Aliased)) {
			result.push({ path: newPath, field });
		} else if (is(field, Table)) {
      //@ts-expect-error Fix this error
			result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
		} else {
			result.push(...orderSelectedFields(field as Record<string, unknown>, newPath));
		}
		return result;
	}, []) as SelectedFieldsOrdered<TColumn>;
}

//! https://github.com/drizzle-team/drizzle-orm/blob/6974798737a2710a6dc6d37d772442d2c895c987/drizzle-orm/src/utils.ts#L14
export function mapResultRow<TResult>(
	columns: SelectedFieldsOrdered<AnyColumn>,
	row: unknown[],
	joinsNotNullableMap: Record<string, boolean> | undefined,
): TResult {
	// Key -> nested object key, value -> table name if all fields in the nested object are from the same table, false otherwise
	const nullifyMap: Record<string, string | false> = {};

	const result = columns.reduce<Record<string, any>>(
		(result, { path, field }, columnIndex) => {
			let decoder: DriverValueDecoder<unknown, unknown>;
			if (is(field, Column)) {
				decoder = field;
			} else if (is(field, SQL)) {
        //@ts-expect-error 
				decoder = field.decoder;
			} else {
        //@ts-expect-error 
				decoder = field.sql.decoder;
			}
			let node = result;
			for (const [pathChunkIndex, pathChunk] of path.entries()) {
				if (pathChunkIndex < path.length - 1) {
					if (!(pathChunk in node)) {
						node[pathChunk] = {};
					}
					node = node[pathChunk];
				} else {
					const rawValue = row[columnIndex]!;
					const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);

					if (joinsNotNullableMap && is(field, Column) && path.length === 2) {
						const objectName = path[0]!;
						if (!(objectName in nullifyMap)) {
							nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
						} else if (
							typeof nullifyMap[objectName] === 'string' && nullifyMap[objectName] !== getTableName(field.table)
						) {
							nullifyMap[objectName] = false;
						}
					}
				}
			}
			return result;
		},
		{},
	);

	// Nullify all nested objects from nullifyMap that are nullable
	if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
		for (const [objectName, tableName] of Object.entries(nullifyMap)) {
			if (typeof tableName === 'string' && !joinsNotNullableMap[tableName]) {
				result[objectName] = null;
			}
		}
	}

	return result as TResult;
}