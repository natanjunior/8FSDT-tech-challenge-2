'use strict';

const UserRepository = require('./repositories/user.repository');
const UserSessionRepository = require('./repositories/userSession.repository');
const PostRepository = require('./repositories/post.repository');
const PostReadRepository = require('./repositories/postRead.repository');
const DisciplineRepository = require('./repositories/discipline.repository');
const CommentRepository = require('./repositories/comment.repository');
const TeacherRepository = require('./repositories/teacher.repository');
const StudentRepository = require('./repositories/student.repository');

const AuthService = require('./services/auth.service');
const PostService = require('./services/post.service');
const PostReadService = require('./services/postRead.service');
const DisciplineService = require('./services/discipline.service');
const CommentService = require('./services/comment.service');
const TeacherService = require('./services/teacher.service');
const StudentService = require('./services/student.service');

const AuthController = require('./controllers/auth.controller');
const PostController = require('./controllers/post.controller');
const ReadController = require('./controllers/read.controller');
const DisciplineController = require('./controllers/discipline.controller');
const CommentController = require('./controllers/comment.controller');
const TeacherController = require('./controllers/teacher.controller');
const StudentController = require('./controllers/student.controller');

const { createAuthenticate } = require('./middlewares/authenticate');

const userRepository = new UserRepository();
const userSessionRepository = new UserSessionRepository();
const postRepository = new PostRepository();
const postReadRepository = new PostReadRepository();
const disciplineRepository = new DisciplineRepository();
const commentRepository = new CommentRepository();
const teacherRepository = new TeacherRepository();
const studentRepository = new StudentRepository();

const authService = new AuthService(
  userRepository, userSessionRepository, teacherRepository, studentRepository
);
const postService = new PostService(postRepository);
const postReadService = new PostReadService(postRepository, postReadRepository);
const disciplineService = new DisciplineService(disciplineRepository);
const commentService = new CommentService(commentRepository, postRepository, teacherRepository, studentRepository);
const teacherService = new TeacherService(teacherRepository, userRepository);
const studentService = new StudentService(studentRepository, userRepository);

const authController = new AuthController(authService);
const postController = new PostController(postService);
const readController = new ReadController(postReadService);
const disciplineController = new DisciplineController(disciplineService);
const commentController = new CommentController(commentService);
const teacherController = new TeacherController(teacherService);
const studentController = new StudentController(studentService);

const authenticate = createAuthenticate(authService, userSessionRepository);

module.exports = {
  authController,
  postController,
  readController,
  disciplineController,
  commentController,
  teacherController,
  studentController,
  authenticate
};
