import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection, ILike } from "typeorm";
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
        if (userData.birthdate) {
            var birthdateSplit : any = userData.birthdate;
            birthdateSplit = birthdateSplit.split("/");
            var year = birthdateSplit[0].split(" ").join("");
            var month = birthdateSplit[1].split(" ").join("");
            var day = birthdateSplit[2].split(" ").join("");
            if (month.length < 2) {
                month = "0" + month;
            }
            if (day.length < 2) {
                day = "0" + day;
            }
            userData.birthdate = `${year}-${month}-${day}`;
        }
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
        const user = await this.findOne({
          where: { email },
        });
        return user;
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
                ) as badges ,
                c.city,
                c.state,
                c.country
            FROM users u
            left join addresses a on a.id = u.address_id
            left join cities c on c.id = a.city_id
            WHERE u.id = $1
        `, [id]), { deep : true });

        let user = results.length ? results[0] : null;

        if (!user) return user;

        let trophies = await this.getUserTrophies(user.id);
        
        user.personalTrophyQuantity = trophies && trophies.personal ? +trophies.personal.quantity : 0;
        user.cityTrophyQuantity = trophies && trophies.city ? +trophies.city.quantity : 0;
        user.globalTrophyQuantity = trophies && trophies.global ? +trophies.global.quantity : 0;
        user.totalTrophyQuantity = trophies ? +trophies.total || 0 : 0;

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

    async usersList(skip: number, limit: number, fullname: string) {
        return this.find({
            select: [ "id","email","fullname", "photoUrl"],
            where: { fullname: ILike(`%${fullname}%`)},
            skip: skip,
            take: limit,
            order: {createdAt: "ASC"}
        });
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