import { faker } from "@faker-js/faker";
import { GeoJSONFeatureTypeEnum, GeoJSONPolygonTypeEnum, Organization, Polygon, PolygonTypeEnum, Register, Service, Station } from "tdei-management-client";

export class TdeiObjectFaker {
    static getService(orgId: string): Service {
        return <Service>{
            service_name: faker.name.firstName() + "_Service",
            tdei_org_id: orgId,
            polygon: this.getPolygon()
        };
    }
    static getStation(orgId: string): Station {
        return <Station>{
            station_name: faker.name.firstName() + "_Station",
            tdei_org_id: orgId,
            polygon: this.getPolygon()
        };
    }
    static getUser(): Register {
        return <Register>{
            email: faker.internet.email(),
            password: "Tester01*",
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            phone: faker.phone.number()
        };
    }

    static getOrganization() {
        return <Organization>{
            org_name: faker.company.name(),
            phone: faker.phone.number('###-###-####'),
            url: faker.internet.url(),
            address: `${faker.address.streetAddress()}, ${faker.address.stateAbbr()}, ${faker.address.country()}`,
            polygon: this.getPolygon()
        };
    }

    static getPolygon(): Polygon {
        return {
            type: PolygonTypeEnum.FeatureCollection,
            features: [
                {
                    type: GeoJSONFeatureTypeEnum.Feature,
                    properties: {},
                    geometry: {
                        // type: "Polygon",
                        type: GeoJSONPolygonTypeEnum.Polygon,
                        coordinates: [this.getCoordinates()]
                    }
                }
            ]
        };
    }

    private static getCoordinates(): number[][] {
        var randomCoordinates: number[][] = [];
        var firstRandom = [
            this.getRandomNumber(70, 79),
            this.getRandomNumber(12, 15)
        ];
        randomCoordinates.push(firstRandom);
        for (let i = 3; i--;) {
            randomCoordinates.push([
                this.getRandomNumber(70, 79),
                this.getRandomNumber(12, 15)
            ]);
        }
        randomCoordinates.push(firstRandom);

        return randomCoordinates;
    }

    private static getRandomNumber(min: number, max: number): number {
        var diff = max - min;
        return parseFloat((min + Math.random() * diff).toFixed(6));
    }
}
