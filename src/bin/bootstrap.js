module.exports = (knex) => {
  const onInsertTrigger = (table) => `
    CREATE TRIGGER before_insert_${table}
    BEFORE INSERT ON ${table}
    FOR EACH ROW
    SET new.id = uuid();
    `;

  new Promise((resolve, reject) => {
    knex.schema.hasTable('hallyos_hosts').then((exists) => {
      if (!exists) {
        knex.schema
          .createTable(`hallyos_hosts`, (t) => {
            t.uuid('id').primary();
            t.string('host').notNullable();
            t.integer('port').notNullable();
            t.string('name');
            t.string('description');
            t.boolean('ping_state').notNullable().defaultTo(false);
            t.integer('last_check_at').defaultTo(-1);
            t.timestamps(true, true);
            t.unique(['host', 'port']);
          })
          .then(() => knex.raw(onInsertTrigger('hallyos_hosts')))
          .then(() => {
            hallyos.log.info("Successfully created table 'hallyos_hosts' ");
            resolve();
          })
          .catch((err) => {
            hallyos.log.error(err);
            reject();
          });
      } else {
        resolve();
      }
    });
  }).then(() => {
    knex.schema.hasTable('hallyos_hosts_stats').then((exists) => {
      if (!exists) {
        knex.schema
          .createTable(`hallyos_hosts_stats`, (t) => {
            t.uuid('id')
              .references('id')
              .inTable('hallyos_hosts')
              .notNull()
              .onDelete('cascade');
            t.integer('response_time').notNullable();
            t.boolean('state').notNullable();
            t.timestamp('at').defaultTo(knex.fn.now());
            t.unique(['id', 'at']);
          })
          .then(() => {
            hallyos.log.info(
              "Successfully created table 'hallyos_hosts_stats' "
            );
          })
          .catch((err) => {
            hallyos.log.error(err);
          });
      }
    });
  });

  new Promise((resolve, reject) => {
    knex.schema.hasTable('hallyos_tickets').then((exists) => {
      if (!exists) {
        knex.schema
          .createTable(`hallyos_tickets`, (t) => {
            t.uuid('id').primary();
            t.string('discord_id', 255).notNullable();
            t.string('channel_id', 255).notNullable();
            t.string('author', 255).notNullable();
            t.integer('state').defaultTo(1);
            t.timestamps(true, true);
          })
          .then(() => knex.raw(onInsertTrigger('hallyos_tickets')))
          .then(() => {
            hallyos.log.info("Successfully created table 'hallyos_tickets'");
            resolve();
          })
          .catch((err) => {
            hallyos.log.error(err);
            reject();
          });
      } else {
        resolve();
      }
    });
  }).then(() => {
    knex.schema
      .hasTable('hallyos_tickets_externals')
      .then((exists) => {
        if (!exists) {
          knex.schema
            .createTable('hallyos_tickets_externals', (t) => {
              t.string('discord_id', 255).notNullable();
              t.string('username').notNullable();
              t.uuid('ticket_id')
                .references('id')
                .inTable('hallyos_tickets')
                .notNull()
                .onDelete('cascade');
              t.string('discord_added_by').notNullable();
              t.timestamps(true, true);
              t.unique(['discord_id', 'ticket_id']);
            })
            .then(() => {
              hallyos.log.info(
                "Successfully created table 'hallyos_tickets_externals' "
              );
            })
            .catch((err) => {
              hallyos.log.error(err);
            });
        }
      })
      .catch((err) => {
        hallyos.log.error(err);
      });
    knex.schema
      .hasTable('hallyos_tickets_messages')
      .then((exists) => {
        if (!exists) {
          knex.schema
            .createTable('hallyos_tickets_messages', (t) => {
              t.uuid('id').primary();
              t.string('discord_author_id', 255).notNullable();
              t.string('discord_message_id').notNullable();
              t.uuid('ticket_id')
                .references('id')
                .inTable('hallyos_tickets')
                .notNull()
                .onDelete('cascade');
              t.string('author').notNullable();
              t.text('content').notNullable();
              t.timestamps(true, true);
            })
            .then(() => knex.raw(onInsertTrigger('hallyos_tickets_messages')))
            .then(() => {
              hallyos.log.info(
                "Successfully created table 'hallyos_tickets_messages' "
              );
            })
            .catch((err) => {
              hallyos.log.error(err);
            });
        }
      })
      .catch((err) => {
        hallyos.log.error(err);
      });
  });

  knex.schema.hasTable('hallyos_logs').then((exists) => {
    if (!exists) {
      knex.schema
        .createTable(`hallyos_logs`, (t) => {
          t.uuid('id').primary();
          t.string('discord_author_id', 255);
          t.string('discord_author_username');
          t.string('ip');
          t.string('author_type');
          t.text('action_type').notNullable();
          t.text('additional_datas');
          t.timestamp('at').defaultTo(knex.fn.now());
        })
        .then(() => knex.raw(onInsertTrigger('hallyos_logs')))
        .then(() => {
          hallyos.log.info("Successfully created table 'hallyos_logs'");
        })
        .catch((err) => {
          hallyos.log.error(err);
        });
    }
  });
};
