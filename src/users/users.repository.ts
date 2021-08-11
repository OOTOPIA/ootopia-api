import { Injectable } from "@nestjs/common";
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
        delete user.password;
        return user;
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