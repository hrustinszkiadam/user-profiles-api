import { IsEmail, IsInt, IsString, Min } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsInt()
  @Min(18)
  age: number;
}
