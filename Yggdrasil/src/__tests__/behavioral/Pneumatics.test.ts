
import AbstractSpruceTest, { test, assert } from '@sprucelabs/test-utils'


export default class PneumaticsTest extends AbstractSpruceTest {
	@test()
	protected static async canCreatePneumatics() {
		const pneumatics = new Pneumatics()
		assert.isTruthy(pneumatics)
	}

	@test()
	protected static async yourNextTest() {
		assert.isTrue(false)
	}
}

class Pneumatics {}
