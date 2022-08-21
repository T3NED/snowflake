import { MAX_INCREMENT_SIZE, MAX_WORKER_ID_SIZE, MAX_PROCESS_ID_SIZE } from "../constants";

export class Snowflake {
	/**
	 * The epoch timestamp for snowflakes
	 */
	#epoch?: bigint;

	/**
	 * The worker id for new snowflakes
	 */
	#workerId = 0n;

	/**
	 * The process id for new snowflakes
	 */
	#processId = 1n;

	/**
	 * The incremental value for the snowflake
	 */
	#increment = 0n;

	/**
	 * Set the snowflake epoch
	 * @param epoch The epoch
	 *
	 * @returns The SnowflakeConstructor
	 */
	public setEpoch(epoch: bigint) {
		this.#epoch = epoch;
		return this;
	}

	/**
	 * Set the snowflake worker id
	 * @param workerId The id of the worker
	 *
	 * @returns The SnowflakeConstructor
	 */
	public setWorkerId(workerId: bigint) {
		this.#workerId = workerId;
		return this;
	}

	/**
	 * Set the snowflake process id
	 * @param processId The id of the process
	 *
	 * @returns The SnowflakeConstructor
	 */
	public setProcessId(processId: bigint) {
		this.#processId = processId;
		return this;
	}

	/**
	 * @returns The epoch timestamp for snowflakes
	 */
	public get epoch(): bigint {
		if (!this.#epoch) throw new Error("Snowflake epoch is not set");
		return this.#epoch;
	}

	/**
	 * @returns The worker id for new snowflakes
	 */
	public get workerId(): bigint {
		return this.#workerId;
	}

	/**
	 * @returns The process id for new snowflakes
	 */
	public get processId(): bigint {
		return this.#processId;
	}

	/**
	 * Generate a snowflake
	 * @param options The generate options
	 *
	 * @returns The generated snowflake
	 */
	public generate(options: Partial<DeconstructedSnowflake> = {}): bigint {
		const workerId = options.workerId ?? this.#workerId;
		const processId = options.processId ?? this.#processId;
		const timestamp = options.timestamp ?? BigInt(Date.now());

		let increment = options.increment;

		if (typeof increment === "bigint" && increment >= MAX_INCREMENT_SIZE) increment = 0n;
		else {
			increment = this.#increment++;
			if (increment >= MAX_INCREMENT_SIZE) this.#increment = 0n;
		}

		return (
			((timestamp - this.epoch) << 22n) |
			((workerId & MAX_WORKER_ID_SIZE) << 17n) |
			((processId & MAX_PROCESS_ID_SIZE) << 12n) |
			(increment & MAX_INCREMENT_SIZE)
		);
	}

	/**
	 * Deconstruct a snowflake
	 * @param snowflake The snowflake to deconstruct
	 *
	 * @returns DeconstructedSnowflake
	 */
	public deconstruct(snowflake: bigint): DeconstructedSnowflake {
		return {
			workerId: (snowflake >> 17n) & MAX_WORKER_ID_SIZE,
			processId: (snowflake >> 12n) & MAX_PROCESS_ID_SIZE,
			increment: snowflake & MAX_INCREMENT_SIZE,
			timestamp: (snowflake >> 22n) + this.epoch,
		};
	}
}

export interface DeconstructedSnowflake {
	/**
	 * The id of the worker the snowflake was generated on
	 */
	workerId: bigint;

	/**
	 * The id of the process the snowflake was generated on
	 */
	processId: bigint;

	/**
	 * The incremental value for the snowflake
	 */
	increment: bigint;

	/**
	 * The timestamp the snowflake was generated
	 */
	timestamp: bigint;
}
