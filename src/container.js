'use strict';

// Repositories (classes)
const UserRepository = require('./repositories/user.repository');
const UserSessionRepository = require('./repositories/userSession.repository');
const PostRepository = require('./repositories/post.repository');
const PostReadRepository = require('./repositories/postRead.repository');
const DisciplineRepository = require('./repositories/discipline.repository');

// Services (classes)
const AuthService = require('./services/auth.service');
const PostService = require('./services/post.service');
const PostReadService = require('./services/postRead.service');
const DisciplineService = require('./services/discipline.service');

// Controllers (classes)
const AuthController = require('./controllers/auth.controller');
const PostController = require('./controllers/post.controller');
const PostReadController = require('./controllers/postRead.controller');
const DisciplineController = require('./controllers/discipline.controller');

// Middleware factories
const { createAuthenticate } = require('./middlewares/authenticate');

// --- Instanciação (composição na raiz) ---

// Repositories
const userRepository = new UserRepository();
const userSessionRepository = new UserSessionRepository();
const postRepository = new PostRepository();
const postReadRepository = new PostReadRepository();
const disciplineRepository = new DisciplineRepository();

// Services (injetando repositories)
const authService = new AuthService(userRepository, userSessionRepository);
const postService = new PostService(postRepository);
const postReadService = new PostReadService(postRepository, postReadRepository);
const disciplineService = new DisciplineService(disciplineRepository);

// Controllers (injetando services)
const authController = new AuthController(authService);
const postController = new PostController(postService);
const postReadController = new PostReadController(postReadService);
const disciplineController = new DisciplineController(disciplineService);

// Middleware (injetando dependências)
const authenticate = createAuthenticate(authService, userSessionRepository);

module.exports = {
	// Controllers
	authController,
	postController,
	postReadController,
	disciplineController,
	// Middleware
	authenticate
};
