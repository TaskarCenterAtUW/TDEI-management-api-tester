# TDEI-management-api-tester
API tester for the tdei-management-client-API received from swagger

## Test Enumeration
Test enumeration is documented [here](https://github.com/TaskarCenterAtUW/TDEI-internaldocs/blob/master/adr/user-management-api-test-cases.md)

## Steps
- The testing rig is currently configured based on `test-harness.json` file.
- An example of the file is already given as `test-harness.example.json`
- `npm i`
- `npm run test`

The above code runs the tests and generates a `test-report.html` (already included for reference)


## Adding more test cases
- create a file in `src/__tests__` folder.
- name it in the format `<group>.test.ts`
- Write test cases based on [jest](https://jestjs.io/docs/getting-started)

## Seed data
When running the test cases, seed data will be provisioned as part of seed.generate() call and it will also generate seed.data.json file.
Generated file will be used as seeding information for subsequent test runs when running locally. If we need to generate seed data fresh there are multiple options specified below
1. Delete the seed.data.json file, which will regenerate file again during test run.
2. When making request to seed.generate() call , we can pass generate fresh seed param while calling seed.generate() call. ex. seed.generate(true)
3. Run below cammand, which will generate new seed file
```
npm run seed
```

## Important notes on writing tests for better readability
- Consider Adding tests in the below format
> Given
- Setup test data in this step
- Give a line break
> When
- Perform some action
- Give a line break
> Then
- Assert result

```  
describe('my-awesome-test', () => {
	const getTestData => return {};
	it('should validate schema response', () => {
		let testData = getTestData();
		let api = new myAwesomeApi();
		
		const result = api.getVersions();

		expect(result.status).toBe(200);
		expect(result.myAwesomeField).toBe('valid');
	});
});
```


## Test Case Documentation:
Below document details the list of test cases to be implemented and against each test case update the status as the implementation is completed.

[Test Case Documentation](https://github.com/TaskarCenterAtUW/TDEI-internaldocs/blob/master/adr/user-management-api-test-cases.md)