import { Utility } from "../utils";
import { AuthApi, Register, RoleDetails, Roles, User, UserManagementApi, OrganizationApi, Organization, OrganizationList } from "tdei-management-client";
import { faker } from '@faker-js/faker';
import { it } from "node:test";

describe("Organization service", () => {
    let configuration = Utility.getConfiguration();
    let configurationWithoutAuthHeader = Utility.getConfiguration();
  
    beforeAll(async () => {
      let generalAPI = new AuthApi(configuration);
      const loginResponse = await generalAPI.authenticate({
        username: configuration.username,
        password: configuration.password
      });
      configuration.baseOptions = {
        headers: { ...Utility.addAuthZHeader(loginResponse.data.access_token) }
      };
    });
  
    describe("Create Organization", () => {
      describe("Validation", () => {
        it("When creating new oraganization with empty name, expect to return HTTP status 400", async () => {
          //Arrange
          let organizationApi = new OrganizationApi(configuration);
          //Act      
          const createOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: "", phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }         
           //Assert
          expect(createOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
        });

        it("When creating new oraganization with empty phone, expect to return HTTP status 400", async () => {
            //Arrange
            let organizationApi = new OrganizationApi(configuration);
            //Act      
            const createOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: "", url: faker.internet.url(), address: faker.address.streetAddress()})) }           
             //Assert
            expect(createOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
          });

          it("When creating new oraganization with empty address, expect to return HTTP status 400", async () => {
            //Arrange
            let organizationApi = new OrganizationApi(configuration);
            //Act      
            const createOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: ""})) }           
             //Assert
            expect(createOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
          });

          //TODO: 
        //   it("When creating new oraganization with invalid polygon, expect to return HTTP status 400", async () => {
        //     //Arrange
        //     let organizationApi = new OrganizationApi(configuration);
        //     //Act      
        //     const createOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "1", org_name: "org", phone: "+1987654321", url: "www.com", address: "USA")) }
        //     //Assert
        //     expect(createOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
        //   });
      });
  
      describe("Functional", () => {
        it("When creating new oraganization, Expect to return newly created org id", async () => {
            //Arrange
            let organizationApi = new OrganizationApi(configuration);
            //Act    
        const createOrganizationResponse = await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) ;
        //Assert
        expect(createOrganizationResponse.status).toBe(200);
        //TODO:
        expect(createOrganizationResponse.data.data).toBe('OrgID')
          });

          //TODO: 
          it("When creating new oraganization with same name, Expect to return HTTP Status 400", async () => {
            //Arrange
            let organizationApi = new OrganizationApi(configuration);
            //Act      
            const createOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }            //Assert
            expect(createOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
          });
      });

      describe("Auth", () => {
        it("When no auth token provided, Expect to return HTTP status 401", async () => {
            //Arrange
            let organizationApi = new OrganizationApi(configurationWithoutAuthHeader);
            //Act      
            const createOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "id", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.company.name(), address: faker.address.country()})) }
            //Assert
            expect(createOrganization()).rejects.toMatchObject({ response: { status: 401 } });;
          });
      });
    });

    describe("Update Organization", () => {
        describe("Validation", () => {
          it("When updating new oraganization with empty name, expect to return HTTP status 400", async () => {
            //Arrange
            let organizationApi = new OrganizationApi(configuration);
            //Act      
            const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }            
            //Assert
            expect(updateOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
          });
  
          it("When updating new oraganization with empty phone, expect to return HTTP status 400", async () => {
              //Arrange
              let organizationApi = new OrganizationApi(configuration);
              //Act      
              const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }            
             //Assert
              expect(updateOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
            });
  
            it("When updating new oraganization with empty address, expect to return HTTP status 400", async () => {
              //Arrange
              let organizationApi = new OrganizationApi(configuration);
              //Act      
              const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) } 
              //Assert
              expect(updateOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
            });

              //TODO: 
        //   it("When creating new oraganization with invalid polygon, expect to return HTTP status 400", async () => {
        //     //Arrange
        //     let organizationApi = new OrganizationApi(configuration);
        //     //Act      
        //     const createOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "1", org_name: "org", phone: "+1987654321", url: "www.com", address: "USA")) }
        //     //Assert
        //     expect(createOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
        //   });
        });
    
        describe("Functional", () => {
          it("When updating new oraganization, Expect to return newly updated org id", async () => {
              //Arrange
              let organizationApi = new OrganizationApi(configuration);
              //Act      
              const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }            
            //Assert
              //TODO: 
              expect(updateOrganization()).toBe('');
            });

            it("When updating new oraganization with same name, Expect to return HTTP Status 400", async () => {
                //Arrange
                let organizationApi = new OrganizationApi(configuration);
                //Act      
                const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }             
                //Assert
                expect(updateOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
              });

        });

        describe("Auth", () => {
            it("When no auth token provided, Expect to return HTTP status 401", async () => {
                //Arrange
                let organizationApi = new OrganizationApi(configurationWithoutAuthHeader);
                //Act      
                const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }                
                //Assert
                expect(updateOrganization()).rejects.toMatchObject({ response: { status: 401 } });;
              });
          });
      });

      describe("Get Organizations", () => {
        describe("Functional", () => {
          it("When searched without filters, Expect to return list of organizations of type OrganizationList", async () => {
            //Arrange
            let organizationApi = new OrganizationApi(configuration);
            //Act
            const response = await organizationApi.getOrganization();

              //Assert
              expect(response.data).toMatchObject(<OrganizationList>{
                tdei_org_id: expect.any(String),
                name: expect.any(String),
                url: expect.any(String),
                address: expect.any(String),
                phone: expect.any(String)
              });
          });
  
          it("When updating new oraganization with empty phone, expect to return HTTP status 400", async () => {
              //Arrange
              let organizationApi = new OrganizationApi(configuration);
              //Act      
              const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }             
               //Assert
              expect(updateOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
            });
  
            it("When updating new oraganization with empty address, expect to return HTTP status 400", async () => {
              //Arrange
              let organizationApi = new OrganizationApi(configuration);
              //Act      
              const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }             
               //Assert
              expect(updateOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
            });

              //TODO: 
        //   it("When creating new oraganization with invalid polygon, expect to return HTTP status 400", async () => {
        //     //Arrange
        //     let organizationApi = new OrganizationApi(configuration);
        //     //Act      
        //     const createOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "1", org_name: "org", phone: "+1987654321", url: "www.com", address: "USA")) }
        //     //Assert
        //     expect(createOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
        //   });
        });
    
        describe("Functional", () => {
          it("When updating new oraganization, Expect to return newly updated org id", async () => {
              //Arrange
              let organizationApi = new OrganizationApi(configuration);
              //Act      
              const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }            
             //Assert
              expect(updateOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
            });

            it("When updating new oraganization with same name, Expect to return HTTP Status 400", async () => {
                //Arrange
                let organizationApi = new OrganizationApi(configuration);
                //Act      
                const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }               
                 //Assert
                expect(updateOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
              });

        });

        describe("Auth", () => {
            it("When no auth token provided, Expect to return HTTP status 401", async () => {
                //Arrange
                let organizationApi = new OrganizationApi(configurationWithoutAuthHeader);
                //Act      
                const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }              
                //Assert
                expect(updateOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
              });
          });
      });

      describe("Delete Organization", () => {
        describe("Auth", () => {
                it("When no auth token provided, Expect to return HTTP status 401", async () => {
                    //Arrange
                    let organizationApi = new OrganizationApi(configurationWithoutAuthHeader);
                    //Act      
                    const deleteOrganization = async () => { await organizationApi.deleteOrganization("id", true) }              
                    //Assert
                    expect(deleteOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
                  });

                  it("When no auth token provided, Expect to return HTTP status 401", async () => {
                    //Arrange
                    let organizationApi = new OrganizationApi(configurationWithoutAuthHeader);
                    //Act      
                    const deleteOrganization = async () => { await organizationApi.deleteOrganization("id", true) }              
                    //Assert
                    expect(deleteOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
                  });
        });
    
        describe("Functional", () => {
          it("When updating new oraganization, Expect to return newly updated org id", async () => {
              //Arrange
              let organizationApi = new OrganizationApi(configuration);
              //Act      
              const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }            
             //Assert
              expect(updateOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
            });

            it("When updating new oraganization with same name, Expect to return HTTP Status 400", async () => {
                //Arrange
                let organizationApi = new OrganizationApi(configuration);
                //Act      
                const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }               
                 //Assert
                expect(updateOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
              });

        });

        describe("Auth", () => {
            it("When no auth token provided, Expect to return HTTP status 401", async () => {
                //Arrange
                let organizationApi = new OrganizationApi(configurationWithoutAuthHeader);
                //Act      
                const updateOrganization = async () => { await organizationApi.createOrganization(<Organization>({tdei_org_id: "", org_name: faker.company.name(), phone: faker.phone.number(), url: faker.internet.url(), address: faker.address.streetAddress()})) }              
                //Assert
                expect(updateOrganization()).rejects.toMatchObject({ response: { status: 400 } });;
              });
          });
      });
  });
  