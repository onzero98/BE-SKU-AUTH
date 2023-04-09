import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

describe('MemberController', () => {
  let memberController: MemberController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [MemberService],
    }).compile();

    memberController = app.get<MemberController>(MemberController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(memberController.getHello()).toBe('Hello World!');
    });
  });
});
