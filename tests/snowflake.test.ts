import { describe, test, expect, vi, beforeAll, afterAll } from "vitest";
import { DeconstructedSnowflake, Snowflake } from "../src";

// 2022-01-01T00:00:00.000Z UTC
const snowflakeEpoch = 1640995200000n;

describe("Snowflake", () => {
	beforeAll(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2022-06-01T23:00:00.000Z"));
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	describe("Snowflake#generate", () => {
		test("GIVEN empty options THEN returns expected snowflake", () => {
			const snowflakeGenerator = new Snowflake() //
				.setEpoch(snowflakeEpoch);

			const expectedSnowflake = 55067856076804096n;
			const snowflake = snowflakeGenerator.generate();

			expect(snowflake).toBe(expectedSnowflake);
		});

		test("GIVEN timestamp THEN returns expected snowflake", () => {
			const snowflakeGenerator = new Snowflake() //
				.setEpoch(snowflakeEpoch);

			const expectedSnowflake = 67026655641604096n;
			const testTimestamp = BigInt(new Date("2022-07-04T23:00:00.000Z").getTime());
			const snowflake = snowflakeGenerator.generate({
				timestamp: testTimestamp,
			});

			expect(snowflake).toBe(expectedSnowflake);
		});

		test("GIVEN generator worker id THEN returns expected snowflake", () => {
			const snowflakeGenerator = new Snowflake() //
				.setEpoch(snowflakeEpoch)
				.setWorkerId(4n);

			const expectedSnowflake = 55067856077328384n;
			const snowflake = snowflakeGenerator.generate();

			expect(snowflakeGenerator.workerId).toBe(4n);
			expect(snowflake).toBe(expectedSnowflake);
		});

		test("GIVEN generator process id THEN returns expected snowflake", () => {
			const snowflakeGenerator = new Snowflake() //
				.setEpoch(snowflakeEpoch)
				.setProcessId(6n);

			const expectedSnowflake = 55067856076824576n;
			const snowflake = snowflakeGenerator.generate();

			expect(snowflakeGenerator.processId).toBe(6n);
			expect(snowflake).toBe(expectedSnowflake);
		});

		test("GIVEN overflowing worker id THEN returns expected snowflake with truncated worker id", () => {
			const snowflakeGenerator = new Snowflake() //
				.setEpoch(snowflakeEpoch);

			const expectedSnowflake = 55067856080211968n;
			const snowflake = snowflakeGenerator.generate({
				workerId: 0b1111_1010n,
			});

			expect(snowflake).toBe(expectedSnowflake);
		});

		test("GIVEN overflowing process id THEN returns expected snowflake with truncated process id", () => {
			const snowflakeGenerator = new Snowflake() //
				.setEpoch(snowflakeEpoch);

			const expectedSnowflake = 55067856076906496n;
			const snowflake = snowflakeGenerator.generate({
				processId: 0b1111_1010n,
			});

			expect(snowflake).toBe(expectedSnowflake);
		});

		test("GIVEN overflowing increment THEN returns expected snowflake with reset increment", () => {
			const snowflakeGenerator = new Snowflake() //
				.setEpoch(snowflakeEpoch);

			const expectedSnowflake = 55067856076804096n;
			const snowflake = snowflakeGenerator.generate({
				increment: 5000n,
			});

			expect(snowflake).toBe(expectedSnowflake);
		});

		test("GIVEN multiple generates THEN returns expected snowflake with truncated process id", () => {
			const snowflakeGenerator = new Snowflake() //
				.setEpoch(snowflakeEpoch);

			const snowflakes = [
				snowflakeGenerator.generate(),
				snowflakeGenerator.generate(),
				snowflakeGenerator.generate(),
				snowflakeGenerator.generate(),
				snowflakeGenerator.generate(),
				snowflakeGenerator.generate(),
				snowflakeGenerator.generate(),
				snowflakeGenerator.generate(),
				snowflakeGenerator.generate(),
				snowflakeGenerator.generate(),
			];

			const uniqueSnowflakes = new Set(snowflakes);

			expect(uniqueSnowflakes.size).toBe(snowflakes.length);
		});

		test("GIVEN no epoch THEN throws error", () => {
			const snowflakeGenerator = new Snowflake();

			expect(() => snowflakeGenerator.generate()).toThrow();
		});
	});

	describe("Snowflake#deconstruct", () => {
		test("GIVEN snowflake THEN returns expected desconstructed snowflake", () => {
			const snowflakeGenerator = new Snowflake() //
				.setEpoch(snowflakeEpoch);

			const snowflake = snowflakeGenerator.deconstruct(55067856077201608n);

			expect(snowflake).toStrictEqual<DeconstructedSnowflake>({
				workerId: 3n,
				processId: 2n,
				increment: 200n,
				timestamp: 1654124400000n,
			});
		});
	});
});
