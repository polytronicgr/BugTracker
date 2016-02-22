import { List, Record, Stack } from 'immutable';

import { expect, deepFreeze, TestRunnerBase, TestFixture, Test } from "../../../test/tests.base";

import { IClassHasMetaImplements, ImplementsClass, ImplementsModel, ImplementsModels, ImplementsPoco } from "./meta";
import { manipulateModel, createModelFromPoco, createModelsFromPoco } from "./parser";

@TestFixture
export class ModelParserTests extends TestRunnerBase {
    @Test empty() {
        var localStorageState = {};
        var expectedCorrectedState = {};
        manipulateModel(localStorageState, TestAppState);

        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState).toEqual(expectedCorrectedState);
    }
    @Test propertyValueOnRecordExists() {
        var localStorageState = { model: { name: "Bob" } };
        var expectedCorrectedState = { model: new LevelOneModel("Bob") };
        manipulateModel(localStorageState, TestAppState);

        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState).toEqual(expectedCorrectedState);
    }
    @Test modelMethodOnRecordExists() {
        var localStorageState = { model: {} };
        var expectedCorrectedState = { model: new LevelOneModel() };
        manipulateModel(localStorageState, TestAppState);

        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState.model.getName).toExist();
    }
    @Test modelMethodOnRecordReturnsCorrectValue() {
        var localStorageState = { model: { name: "Bob" } };
        var expectedCorrectedState = { model: new LevelOneModel("Bob") };
        manipulateModel(localStorageState, TestAppState);
        
        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState.model.getName()).toEqual("Bob");
    }
    @Test emptyListOfModels() {
        var localStorageState = { models: <any[]>[] };
        var expectedCorrectedState = { models: List<LevelOneModel>() };
        manipulateModel(localStorageState, TestAppState);

        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState).toEqual(expectedCorrectedState);
        expect(modifiedLocalStorageState.models.count()).toEqual(0);
    }
    @Test ignoreIterables() {
        var localStorageState = { models: List<LevelOneModel>() };
        var expectedCorrectedState = { models: List<LevelOneModel>() };
        manipulateModel(localStorageState, TestAppState);

        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState).toEqual(expectedCorrectedState);
        expect(modifiedLocalStorageState.models.count()).toEqual(0);
    }
    @Test listOfModels() {
        var localStorageState = { models: [
            { name: "Bob" }, { name: "Sally" }
        ] };
        var expectedCorrectedState = { models: List<LevelOneModel>([
            new LevelOneModel("Bob"), new LevelOneModel("Sally")
        ]) };
        manipulateModel(localStorageState, TestAppState);

        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState).toEqual(expectedCorrectedState);
        expect(modifiedLocalStorageState.models.get(0).name).toEqual("Bob");
        expect(modifiedLocalStorageState.models.get(1).name).toEqual("Sally");
    }
    @Test propertyValueOnRecordInRecordExists(){
        var localStorageState = { model: { model: {name:"Bob"} } };
        var expectedCorrectedState = { model: new LevelOneModel(null, new LevelOneModel("Bob")) };
        manipulateModel(localStorageState, TestAppState);
        
        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState).toEqual(expectedCorrectedState);
    }
    @Test modelMethodOnRecordInRecordExists() {
        var localStorageState = { model: { model: {name:"Bob"} } };
        var expectedCorrectedState = { model: new LevelOneModel(null, new LevelOneModel("Bob")) };
        manipulateModel(localStorageState, TestAppState);

        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState.model.model.getName).toExist();
    }
    @Test modelMethodOnRecordInRecordReturnsCorrectValue() {
        var localStorageState = { model: { model: {name:"Bob"} } };
        var expectedCorrectedState = { model: new LevelOneModel(null, new LevelOneModel("Bob")) };
        manipulateModel(localStorageState, TestAppState);
        
        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState.model.model.getName()).toEqual("Bob");
    }
    @Test listOfModelsInModels() {
        var localStorageState = { models: [ { models: [
            { name: "Bob" }, { name: "Sally" }
        ] } ] };
        var expectedCorrectedState = { models: List<LevelOneModel>([ new LevelOneModel(null, null, List<LevelOneModel>([
            new LevelOneModel("Bob"), new LevelOneModel("Sally")
        ])) ]) };
        manipulateModel(localStorageState, TestAppState);

        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState).toEqual(expectedCorrectedState);
        expect(modifiedLocalStorageState.models.get(0).models.get(0).name).toEqual("Bob");
        expect(modifiedLocalStorageState.models.get(0).models.get(1).name).toEqual("Sally");
    }
    @Test propertyValueOnRecordInRecordWithDifferentModelsExists(){
        var localStorageState = { user: { pet: { name: "Boy" } } };
        var expectedCorrectedState = { user: new UserModel(null, new PetModel("Boy")) };
        manipulateModel(localStorageState, TestAppState);
        
        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState).toEqual(expectedCorrectedState);
    }
    @Test modelMethodOnRecordInRecordWithDifferentModelsReturnsCorrectValue(){
        var localStorageState = { user: { pet: { name: "Boy" } } };
        var expectedCorrectedState = { user: new UserModel(null, new PetModel("Boy")) };
        manipulateModel(localStorageState, TestAppState);
        
        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState.user.pet.bark()).toEqual("Boy");
    }
    @Test nestedModelReturningANewModelHasModelMethods(){
        var localStorageState = { user: { pet: { name: "Boy" } } };
        var expectedCorrectedState = { user: new UserModel(null, new PetModel("Boy")) };
        manipulateModel(localStorageState, TestAppState);
        
        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        var newModel = modifiedLocalStorageState.user.pet.transform("Puppy");
        expect(newModel.bark()).toEqual("Puppy");
    }
    @Test modifiedModelModifyingAPropertyReturningCorrectValue(){
        var localStorageState = { user:{name:"Bob"}};
        var expectedCorrectedState = { user:new UserModel("Bob")};
        manipulateModel(localStorageState, TestAppState);
        
        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        
        var newUser = modifiedLocalStorageState.user.setName("Sally");
        
        expect(newUser.name).toEqual("Sally");
    }
    @Test creationOfStackWorks(){
        var localStorageState = { userStack:[{name:"Bob"}, {name:"Sally"}]};
        var expectedCorrectedState = { userStack:Stack<UserModel>([new UserModel("Bob"), new UserModel("Sally")])};
        manipulateModel(localStorageState, TestAppState);
        
        var modifiedLocalStorageState = <TestAppState><any>localStorageState;
        expect(modifiedLocalStorageState).toEqual(expectedCorrectedState);
        
        expect(modifiedLocalStorageState.userStack.peek().name).toEqual("Bob");
        expect(modifiedLocalStorageState.userStack.pop().peek().name).toEqual("Sally");
    }
    @Test simulateWebApiResponse_transformSingleUser(){
        var json = `{"name":"Bob"}`;
        var userResponsePoco = JSON.parse(json);
        var expectedUserModel = new UserModel("Bob");
        
        var modifiedUserPoco = createModelFromPoco<UserModel>(UserModel, userResponsePoco);
        
        expect(modifiedUserPoco).toEqual(expectedUserModel);
    }
    @Test simulateWebApiResponse_transformArrayOfUsers(){
        var json = `[{"name":"Bob"},{"name":"Sally"}]`;
        var userResponsePoco = JSON.parse(json);
        var expectedUserModel = List<UserModel>([new UserModel("Bob"),new UserModel("Sally")]);
        
        var modifiedUserPoco = createModelsFromPoco<UserModel>(List, UserModel, userResponsePoco);
        
        expect(modifiedUserPoco).toEqual(expectedUserModel);
    }
}

interface ILevelOneModel {
    name: string
    model: LevelOneModel;
    models: List<LevelOneModel>;
    getName(): string;
}
const LevelOneModelRecord = Record(<ILevelOneModel>{
    name: <string>null,
    model: <LevelOneModel>null,
    models: <List<LevelOneModel>>null
});
@ImplementsClass(LevelOneModelRecord)
class LevelOneModel extends LevelOneModelRecord implements ILevelOneModel, IClassHasMetaImplements {
    @ImplementsPoco() public name: string;
    @ImplementsModel(() => LevelOneModel) public model: LevelOneModel;
    @ImplementsModels(List, () => LevelOneModel) public models: List<LevelOneModel>;

    public getName() {
        return this.name;
    }

    constructor(name: string=null, model:LevelOneModel=null, models:List<LevelOneModel>=null) {
        super({ 
            name, 
            model,
            models
        });
    }
}

interface IUserModel{
    name:string,
    pet:PetModel
}
const UserModelRecord = Record(<IUserModel>{
    name:<string>null,
    pet:<PetModel>null
})
@ImplementsClass(UserModelRecord)
class UserModel extends UserModelRecord implements IUserModel, IClassHasMetaImplements{
    @ImplementsPoco() public name:string;
    @ImplementsModel(() => PetModel) public pet:PetModel;
    public setName(name:string):UserModel{
        var newImmutable = <UserModel>this.withMutations(map => {
            map.set("name", name);
        });
        return newImmutable;
    }
    constructor(name:string=null, pet:PetModel=null){
        super({
            name,
            pet
        })
    }
}

interface IPetModel{
    name:string,
    transform(name:string):PetModel,
    bark():string
}
const PetModelRecord = Record(<IPetModel>{
    name:<string>null
})
@ImplementsClass(PetModelRecord)
class PetModel extends PetModelRecord implements IPetModel, IClassHasMetaImplements{
    @ImplementsPoco() public name:string;
    public bark(){
        return this.name;
    }
    public transform(name:string){
        return <PetModel>this.withMutations(map => {
            map.set("name", name);
        });
    }
    constructor(name:string=null){
        super({
            name
        })
    }
}

class TestAppState {
    @ImplementsModel(() => LevelOneModel) public model: LevelOneModel;
    @ImplementsModels(List, () => LevelOneModel) public models: List<LevelOneModel>;
    @ImplementsModel(() => UserModel) public user: UserModel;
    @ImplementsModels(Stack, () => UserModel) public userStack: Stack<UserModel>;
}