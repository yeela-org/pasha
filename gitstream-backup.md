# -*- mode: yaml -*-

# +----------------------------------------------------------------------------+
# | PLEASE READ                                                                |
# +----------------------------------------------------------------------------+
# | Scroll to the bottom of the file for settings and watchers.                |
# |                                                                            |
# | The rest of the file should remain untouched unless making changes to      |
# | how our automations work.                                                  |
# |                                                                            |
# | This file uses YAML syntax plus nunjucks templating                        |
# +----------------------------------------------------------------------------+

# Variables: https://docs.gitstream.cm/context-variables/
#   Filters: https://docs.gitstream.cm/filter-functions/
#   Actdions: https://docs.gitstream.cm/automation-actions/dxsadss
s
manifest:
  version: 1.0

config:
  # list files to be ignored by estimatedReviewTime operation
  # https://docs.gitstream.cm/filter-functions/#estimatedreviewtime
  ignore_files:
    - './gen/**'

automations:

  # prints out all the variables the gitstream provides for easy access to what
  # their values are like - some are marked "-redacted-" cause their output
  # can be super long
  print_variables:
    if:
      - {{ setting.PRINT_VARIABLES }}
    run:
      - action: add-comment@v1
        args:
          comment: |
            branch
            - author: {{ branch.author }}
            - author_name: {{ branch.author_name }}
            - author_email: {{ branch.author_email }}
            - base: {{ branch.base }}
            - commits
              - messages: {{ branch.commits.messages | dump | safe }}
            - diff
              - size: {{ branch.diff.size }}
              - files:
                {{ branch.diff.files_metadata | dump | safe }}
            - name: {{ branch.name }}
            - num_of_commits: {{ branch.num_of_commits }}
            files ({{ files | length }}):
            {{ files | dump | safe }} 
            pr
            - approvals: {{ pr.approvals | dump | safe }}
            - author: {{ pr.author }}
            - author_teams ({{ pr.author_teams | length }}): {{ pr.author_teams }}
            - checks ({{ pr.checks | length }}): {{ pr.checks }}
            - created_at: {{ pr.created_at }}
            - draft: {{ pr.draft }}
            - description: -redacted-
            - general_comments ({{ pr.general_comments | length }}): -redacted-
            - line_comments ({{ pr.line_comments | length }}): {{ pr.line_comments | dump | safe }}
            - provider: {{ pr.provider | dump | safe }}
            - reviewers: {{ pr.reviewers | dump | safe }}
            - status: {{ pr.status }}
            - title: {{ pr.title }}
            - updated_at: {{ pr.updated_at }}
            repo
            - git_activity: {{ repo.git_activity | dump | safe }}
            - age: {{ repo.age }}
            - author_age: {{ repo.author_age }}
            - blame: {{ repo.blame | dump | safe }}
            - contributors: {{ repo.contributors | dump | safe }}
            source
            - diff
              - files ({{ source.diff.files | length }}):
                - original_file: {{ source.diff.files | map(attr='original_file') | dump | safe }}
                - new_file: {{ source.diff.files | map(attr='new_file') | dump | safe }}
                - diff: -redacted-
                - original_content: -redacted-
                - new_content: -redacted-
  # gitstream's approach to codeowners is to instead assign certain
  # reviewers when "sensitive" files are changed - this takes it a step further
  # to watch for different types of changes and do different things based
  # on a simple config object
  # - output can be slimmed/improved once gitstream offers js plugins to write
  #   more custom stuff
  # - additional config can be added like to notify via comment vs assign
  #   reviewer or any other flexibility needed
  # https://docs.gitstream.cm/examples/#like-codeowners-but-better
  {% for item in watchers %}
  notify_watcher_{{ item.owner if item.owner else item.team }}:
    if:
      - {{ not pr.draft }}
      - {{ (files | match(list=item.files) | some) or (source.diff.files | match(attr="diff", list=item.diffs) | some) }}
    run:
      - action: add-comment@v1
        args:
          comment: |
            @{{ item.owner if item.owner else (["dtx-company/", item.team] | join) }} - this PR has changes you're watching
            {% if files | match(list=item.files) | some -%}
            files:
            {%- for file in files | filter(list=item.files) %}
            - {{ file }}
            {%- endfor -%}
            {%- endif %}
            {% if source.diff.files | match(attr="diff", list=item.diffs) | some -%}
            diffs:
            {%- for diff in item.diffs -%}
            {%- if source.diff.files | match(attr="diff", list=diff) | some %}
            - {{ diff }}
              {%- for file in source.diff.files | filter(attr="diff", list=diff) | map(attr="new_file") %}
              - {{ file }}
              {%- endfor -%}
            {%- endif -%}
            {%- endfor -%}
            {%- endif %}
      - action: add-reviewers@v1
        args:
          reviewers: {{ item.owner }}
          team_reviewers: {{ item.team }}
  {% endfor %}

  # auto-approve PRs that are just doc, formatting, and test changes
  # https://github.com/linear-b/gitstream/blob/main/automations/approve_safe_changes/approve-safe-changes.cm
  approve_safe_changes:
    if:
      - {{ is.formatting or is.docs or is.tests }}
    run:
      - action: add-label@v1
        args:
          label: 'safe-changes'
          color: {{ color.purple }}
      - action: approve@v1
  
  # assign people that are "experts" in the review for better quality reviews
  # https://docs.gitstream.cm/examples/#review-prs-with-code-experts
  assign_experts:
    if:
      - {{ not pr.draft }}
      - {{ setting.expert_percent > 0 }}
      - {{ repo | codeExperts(gt=setting.expert_percent) | some }}
    run:
      - action: add-comment@v1
        args:
          comment: |
            {{ repo | explainCodeExperts(gt=setting.expert_percent) }}
      - action: add-reviewers@v1
        args:
          reviewers: {{ repo | codeExperts(gt=setting.expert_percent) }}

  # assign people that previously contributed a meaningful amount to participate
  # in the review for better quality reviews
  # https://github.com/linear-b/gitstream/blob/main/automations/assign_the_right_reviewers/assign-the-right-reviewers.cm
  assign_previous_contributors:
    if:
      - {{ not pr.draft }}
      - {{ setting.previous_contributor_percent > 0 }}
      - {{ repo | rankByGitBlame(gt=setting.previous_contributor_percent) | some }}
    run:
      - action: add-comment@v1
        args:
          comment: |
            {{ repo | explainRankByGitBlame(gt=setting.previous_contributor_percent) | dump | safe }}
      - action: add-reviewers@v1
        args:
          reviewers: {{ repo | rankByGitBlame(gt=setting.previous_contributor_percent) }}

  # assign team members to review since they are likely familiar with the
  # feature or bug being worked on and the general code area in order
  # to give a high quality review
  # https://github.com/linear-b/gitstream/blob/main/automations/assign_team_members_as_reviewers/assign-team-to-prs-by-their-member.cm
  assign_team_members:
    if:
      - {{ not pr.draft }}
      - {{ (setting.review_teams | length) > 0}}
    run:
      - action: add-reviewers@v1
        args:
          # Using a reject as well cause the filter for some reason is not excluding them, seems like a weird bug
          team_reviewers: {{ pr.author_teams | filter(list=setting.review_teams) | reject(list=['FE Code Reviewers']) }}

  # add a label with the estimated time to review
  # https://docs.gitstream.cm/examples/#label-prs-by-complexity
  label_estimated_time_to_review:
    if:
      - true
    run:
      - action: add-label@v1
        args:
          label: "{{ calc.etr }} min review"
          color: {{ color.red if (calc.etr >= 30) else (color.yellow if (calc.etr >= 10) else color.green) }}

  # require extra PR reviews for new contributors to give them more support
  # https://docs.gitstream.cm/examples/#require-2-approvals-for-complex-prs
  label_new_contributors:
    if:
      - {{ not pr.draft }}
      - true
    run:
      - action: add-label@v1
        args:
          label: 'new-contibutor'
          color: {{ color.purple }}
      - action: add-reviewers@v1
        args:
          team_reviewers: {{ setting.senior_team_reviewer }}
      - action: set-required-approvals@v1
        args:
          approvals: 2
      - action: add-comment@v1
        args:
          comment: |
            Welcome to the repo!
            
            Your PRs will require `2` reviewers for `{{ setting.new_contributor_days - repo.author_age }}` more {{ "day" if setting.new_contributor_days - repo.author_age == 1 else "days" }} to help give you more support.
  # mark when a PR is missing a story, PRs should always have a story for
  # easy back-referencing later
  # https://github.com/linear-b/gitstream/blob/main/automations/check_ticket_for_every_pr/check-ticket-in-pr.cm
  # require_story:
  #   if:
  #     - {{ not pr.title | includes(regex=r/\[sc-\d+\]$/) }}
  #   run:
  #     - action: add-label@v1
  #       args:
  #         label: "missing-story"
  #         color: {{ color.bad }}
  #     - action: add-comment@v1
  #       args:
  #         comment: |
  #           Every PR title must end with a `[sc-00000]` indicator to the shortcut story

calc:
  etr: {{ branch | estimatedReviewTime }}

is:
  simple: {{ branch | estimatedReviewTime < 10 }}
  complex: {{ branch | estimatedReviewTime > 30 }}
  formatting: {{ source.diff.files | isFormattingChange }}
  docs: {{ files | allDocs }}
  tests: {{ files | allTests }}

color:
  red: 'B60205'
  orange: 'D93F0B'
  yellow: 'FBCA04'
  green: '0E8A16'
  blue: '1D76DB'
  purple: '5319E7'

# For sensitive areas of code, assign yourself or your team to be
# notified when changes are made.
# You won't be required for PR approval but will be notified of
# the changes so any potential concerns may be raised.
# - files: substring match any file paths to be notified on
# - diffs: substring match any diff lines to be notified on
watchers:
  - owner: emilyobaditch
    files:
    - optimizely
  - team: ie
    files:
    - package.json
    - yarn.lock
  - owner: michaeldrotar
    files:
    - HeapTracker
    - HubSpot
    - shared/intercom
    - useFlowExperiment
    - useFlowFeature
  - team: monetization
    files:
    - AccountBillingPage
    - common/src/api/subscription-service
    - pages/Plans
    - shared/purchase-locks
    - UpgradePage
    - useBillingPlanType
  - team: templates-fe
    files:
    - apps/app/pages/store
    - apps/app/pages/templates
    - apps/app/shared/templates
    - packages/code/components/print-store
    - packages/code/components/PrintStoreTemplates
    - packages/code/containers/print-store
    - packages/code/containers/PrintStoreTemplates
    - packages/code/containers/ShoppingCart
    - packages/common/redux/slices/printStoreApiSlice

# Configure settings below.
# These are things that may vary from repo to repo to control how
# automations work while maintaining a consistent set of them that
# can otherwise be copy/pasted across repos.
setting:

  # Set to true to enable some debug output to see variable values
  # (should never be committed as true)
  PRINT_VARIABLES: false

  # Users that are "experts" by more than this percent on a PR's changes
  # will be asked to review it
  # (disable: 0, default: 10)
  expert_percent: 0

  # How many days will people be considered "new" to the repo
  # and require extra hands-on help like an additional review
  # (disable: 0, default: 30)
  new_contributor_days: 30

  # Users that have contributed more than this percent to a file
  # are considered a previous contributor and will be asked to review it
  # (disable: 0, default: 25)
  previous_contributor_percent: 0

  # List teams to be eligible for reviews when one of their teammates
  # submits a PR
  review_teams:
    # - data-team
    # - flowlytics
    # - ie
    # - monetization
    # - platform
    # - platform-products
    # - sre
    # - templates

  # Assign a github team that will have additional responsibilities
  # like providing an additional review for people that are new
  # to the repo
  senior_team_reviewer: senior-fe-eng
