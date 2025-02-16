"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const user_controller_1 = require("./modules/users/user.controller");
const profession_controller_1 = require("./modules/profession/profession.controller");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./modules/users/entities/user.entity");
const profession_entity_1 = require("./modules/profession/entities/profession.entity");
const profession_service_1 = require("./modules/profession/profession.service");
const profession_module_1 = require("./modules/profession/profession.module");
const setting_module_1 = require("./modules/settings/setting.module");
const setting_entity_1 = require("./modules/settings/entities/setting.entity");
const room_entity_1 = require("./modules/rooms/entities/room.entity");
const room_module_1 = require("./modules/rooms/room.module");
const game_module_1 = require("./modules/game/game.module");
const config_1 = require("@nestjs/config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: 'postgres',
                port: 5432,
                username: 'your_user',
                password: 'your_password',
                database: 'your_db',
                entities: [user_entity_1.User, profession_entity_1.Profession, setting_entity_1.Setting, room_entity_1.Room],
                synchronize: true,
            }),
            profession_module_1.ProfessionsModule,
            setting_module_1.SettingsModule,
            room_module_1.RoomModule,
            game_module_1.GameModule,
            config_1.ConfigModule.forRoot(),
        ],
        exports: [typeorm_1.TypeOrmModule],
        controllers: [app_controller_1.AppController, user_controller_1.UsersController, profession_controller_1.ProfessionsController],
        providers: [app_service_1.AppService, profession_service_1.ProfessionsService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map