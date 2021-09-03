import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { Users } from "./users.entity";

@Injectable()
@EntityRepository(Users)
export class UsersRepository extends Repository<Users>{

    constructor() {
        super();
    }

    async createOrUpdateUser(userData) {
        const user = this.create();
        Object.assign(user, userData);
        return await this.save(user);
    }

    async createUser(userData) {
        const user = this.create();
        Object.assign(user, userData);
        return user;
    }

    async deleteUser(id) {
        if (!id) {
            return null;
        }
        return this.delete(id);
    }

    async resetPassword(id: string, password: string) {
        let result = await getConnection()
        .createQueryBuilder()
        .update(Users)
        .set({ password })
        .where("id = :id", { id })
        .execute();
        if (result && result.affected){
            return { status: "ok" }
        }else{
            return null;
        }
    }

    async updateDailyGoalAchieved(id: string, dailyGoalAchieved: boolean) {
        let result = await getConnection()
        .createQueryBuilder()
        .update(Users)
        .set({ dailyGoalAchieved })
        .where("id = :id", { id })
        .execute();
        if (result && result.affected){
            return { status: "ok" }
        }else{
            return null;
        }
    }

    async getUserByEmail(email: string) {
        const user = await this.find({
          where: { email },
        });
        return (user && user.length ? user[0] : null);
    }

    //I use the manual query because the typeOrm does not return related tables without the join, in this case, it would not return the address_id column
    async getUserById(id: string) {
        let results = camelcaseKeys(await getConnection().query(`
            SELECT 
                u.*, 
                array (
                    select 
                    json_build_object('Icon', b.icon, 'Name', b.name) as bdg
                    from user_badges
                    inner join badges b ON b.id = user_badges.badges_id
                    where user_badges.user_id = u.id
                ) as badges
            FROM users u
            WHERE u.id = $1
        `, [id]), { deep : true });

        let user = results.length ? results[0] : null;

        if (!user) return user;

        let trophies = await this.getUserTrophies(user.id);
        
        user.personalTrophyQuantity = trophies.personal ? +trophies.personal.quantity : 0;
        user.cityTrophyQuantity = trophies.city ? +trophies.city.quantity : 0;
        user.globalTrophyQuantity = trophies.global ? +trophies.global.quantity : 0;
        user.totalTrophyQuantity = +trophies.total || 0;

        delete user.password;
        return user;
    }

    async getUserTrophies(userId: string) {
        let results : any[] = camelcaseKeys(await getConnection().query(`
            SELECT * FROM users_trophies WHERE user_id = $1
        `, [userId]), { deep : true });
        let trophies : any = results.length ? results : null;
        if (trophies) {
            let personalTrophy = results.filter((t) => t.trophyType == "personal");
            let cityTrophy = results.filter((t) => t.trophyType == "city");
            let globalTrophy = results.filter((t) => t.trophyType == "global");
            trophies = {
                "personal" : personalTrophy.length ? personalTrophy[0] : null,
                "city" : cityTrophy.length ? cityTrophy[0] : null,
                "global" : globalTrophy.length ? globalTrophy[0] : null,
                "total" : results.map((t) => +t.quantity).reduce((total, value) => total + value),
            };
        }
        return trophies;
    }

    async putDialogOpened(id : string, dialogType : string){
        let data : any = {};
        switch(dialogType) {
            case "personal":
                data.personalDialogOpened = true;
                break;
            case "city":
                data.cityDialogOpened = true;
                break;
            case "global":
                data.globalDialogOpened = true;
                break;
            default:
                throw new HttpException("Undefined type", 401);
        }
        
        let result = await getConnection()
        .createQueryBuilder()
        .update(Users)
        .set(data)
        .where("id = :id", { id })
        .execute();
        if (result && result.affected){
            return { status: "ok" }
        }else{
            return null;
        }

    }

    async updateDontAskToConfirmGratitudeReward(id : string, value : boolean) {
        return getConnection()
            .createQueryBuilder()
            .update(Users)
            .set({ dontAskAgainToConfirmGratitudeReward : true })
            .where("id = :id", { id })
            .execute();
    }

}