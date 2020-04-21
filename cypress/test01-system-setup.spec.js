describe('Typemill Setup', function() 
{
    it('validates form input', function ()
    {
      // visit setup form
      cy.visit('/setup')
      cy.url().should('include','/setup')

      // add data and check attributes
      cy.get('input[name="username"]')
        .type('?1')
        .should('have.value', '?1')
        .and('have.attr', 'required')

      cy.get('input[name="email"]')
        .type('trendschau.net')
        .should('have.value', 'trendschau.net')
        .and('have.attr', 'required')
     
      cy.get('input[name="password"]')
        .type('pass')
        .should('have.value', 'pass')
        .and('have.attr', 'required')
        
      // submit and get validation errors
      cy.get('form').submit()
      cy.get('#flash-message').should('contain', 'Please check your input and try again')
      cy.get('.error').should('contain', 'invalid characters')
      cy.get('.error').should('contain', 'e-mail is invalid')
      cy.get('.error').should('contain', 'Length between 5 - 20')
    })

    it('fails without CSRF-token', function ()
    {
      cy.request({
        method: 'POST',
        url: '/setup', // baseUrl is prepended to url
        form: true, // indicates the body should be form urlencoded and sets Content-Type: application/x-www-form-urlencoded headers
        failOnStatusCode: false,
        body: {
          username: 'trendschau', 
          email: 'trendschau@gmail.com', 
          password: 'password'
        }
      })
        .its('body')
        .should('include', 'Failed CSRF check')
    })

    it('submits valid form data and visit welcome and settings page', function () 
    {
      cy.visit('/setup')

      // enter correct data
      cy.get('input[name="username"]').clear().type('trendschau')
      cy.get('input[name="email"]').clear().type('trendschau@gmail.com')
      cy.get('input[name="password"]').clear().type('password')
  
      // submits valid form
      cy.get('form').submit()
      cy.url().should('include','/welcome')
      cy.getCookie('typemill-session').should('exist')
      Cypress.Cookies.preserveOnce('typemill-session')
      
      // clicks link on welcome page to settings page
      cy.get('.button').should('contain', 'Configure your website')
      cy.get('.button').click()
      cy.url().should('include', '/tm/settings')        
    })

    it('creates default settings data', function()
    {
      cy.get('input[name="settings[title]"]')
        .should('have.value', 'TYPEMILL')
        .and('have.attr','required')
      cy.get('input[name="settings[author]"]')
        .should('have.value', 'Unknown')
      cy.get('select[name="settings[copyright]"]')
      cy.get('input[name="settings[year]"]')
        .should('have.attr', 'required')
      cy.get('select[name="settings[language]"]')
      cy.get('input[name="settings[sitemap]"]')
        .should('have.value', 'http://localhost/typemillTest/cache/sitemap.xml')
        .and('have.attr','readonly')
        Cypress.Cookies.preserveOnce('typemill-session')
      })

    it('creates default user data', function()
    {
      cy.visit('/tm/user/trendschau')
      cy.url().should('include', '/tm/user/trendschau')
    
      cy.get('input[name="showusername"]')
        .should('have.value', 'trendschau')
        .and('have.attr','disabled')
      cy.get('input[name="username"]')
        .should('have.value', 'trendschau')
      cy.get('input[name="email"]')
        .should('have.value', 'trendschau@gmail.com')
        .and('have.attr','required')
      cy.get('select[name="userrole"]')
        .should('have.attr','required')
      cy.get('input[name="password"]')
        .should('have.value', '')
      cy.get('input[name="newpassword"]')
        .should('have.value', '')
    })

    it('logouts out', function()
    {
      // visits logout link
      cy.visit('/tm/logout')
      cy.url().should('include', '/tm/login')

      // tries to open setup form again and gets redirected to login
      cy.visit('/setup')
      cy.url().should('include','/login')
    })

    it('redirects when tries to setup again', function()
    {
      // tries to open setup form again and gets redirected to login
      cy.visit('/setup')
      cy.url().should('include','/login')
  })
})