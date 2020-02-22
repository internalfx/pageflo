require('@babel/register')({
  cwd: __dirname,
  plugins: ['@babel/plugin-transform-modules-commonjs'],
  only: [
    './lib/*'
  ]
})

const path = require('path')
const appDir = path.join(__dirname)

const substruct = require('@internalfx/substruct')
const inquirer = require('inquirer')
const _ = require('lodash')

const configPath = path.join(process.cwd(), 'config.js')
const userConfig = require(configPath)

substruct.configure({
  build: false,
  runCron: false,
  runDir: process.cwd(),
  appDir,
  ...userConfig
})

substruct.load().then(async function ({ koa, config }) {
  const { arango, aql } = substruct.services.arango
  const bcrypt = substruct.services.bcrypt

  const mainMenu = async function () {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Create User', value: 'create' },
          { name: 'Reset User Password', value: 'reset' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ])

    if (answers.action === 'create') {
      await createUser()
      await mainMenu()
    } else if (answers.action === 'reset') {
      await resetPassword()
      await mainMenu()
    } else if (answers.action === 'exit') {
      await substruct.stop()
    }
  }

  const createUser = async function () {
    const answers = await inquirer.prompt([
      {
        type: 'email',
        name: 'email',
        message: 'Email?'
      },
      {
        type: 'list',
        name: 'role',
        message: 'Role?',
        choices: [
          { name: 'User', value: 'USR' },
          { name: 'Administrator', value: 'ADM' }
        ]
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password?'
      }
    ])

    let record = _.omit(answers, 'password')

    record.createdAt = new Date()
    record.updatedAt = new Date()

    record.passwordHash = await bcrypt.hashPassword(answers.password)

    record = await arango.qNext(aql`
      INSERT ${record} INTO users RETURN NEW
    `)

    console.log('User Created!')
  }

  const resetPassword = async function () {
    let users = await arango.qAll(aql`
      FOR user IN users
        RETURN user
    `)

    users = users.map(function (user) {
      return {
        name: `${user.email}`,
        value: user._key
      }
    })

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'user',
        message: 'User?',
        choices: users
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password?'
      }
    ])

    const passwordHash = await bcrypt.hashPassword(answers.password)

    await arango.q(aql`
      UPDATE ${answers.user} WITH { passwordHash: ${passwordHash} } IN users
    `)

    console.log('Password Updated!')
  }

  return mainMenu()
}).catch(function (err) {
  console.log(err)
})
