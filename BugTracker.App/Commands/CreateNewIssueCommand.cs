﻿using System.Threading.Tasks;

using BugTracker.App.Models;
using BugTracker.Data.Repositories.Abstract;
using BugTracker.Shared.Command.Abstract;
using BugTracker.Shared.Command.Entities;
using BugTracker.Shared.Extensions;

namespace BugTracker.App.Commands
{
    internal class CreateNewIssueCommand : CommandBase<IssueModel>
    {
        private readonly IIssueAccess issueAccess;
        private readonly IUserAccess userAccess;
        private IssueModel issueModel;

        public CreateNewIssueCommand(IIssueAccess issueAccess, IUserAccess userAccess)
        {
            this.issueAccess = issueAccess;
            this.userAccess = userAccess;
        }

        public void Initialize(IssueModel issueModel)
        {
            this.issueModel = issueModel;
        }

        protected override Task<CanExecuteCommandResult> CanExecuteAsync()
        {
            if (this.issueModel == null)
            {
                return this.CannotExecute("The issue model is null.").ToTaskResult();
            }
            if (string.IsNullOrWhiteSpace(this.issueModel.Title))
            {
                return this.CannotExecute("The title is null or empty.").ToTaskResult();
            }
            if (string.IsNullOrWhiteSpace(this.issueModel.Content))
            {
                return this.CannotExecute("The content is null or empty.").ToTaskResult();
            }
            this.issueModel.Title = this.issueModel.Title.Trim();
            this.issueModel.Content = this.issueModel.Content.Trim();

            var maybeUser = this.userAccess.TryGetById(this.issueModel.UserId);
            if (maybeUser.HasNoValue)
            {
                return this.CannotExecute($"The user with id {this.issueModel.UserId} does not exist.").ToTaskResult();
            }

            return base.CanExecuteAsync();
        }

        protected override Task<CommandResult<IssueModel>> ExecuteAsync()
        {
            var newIssue = this.issueAccess.Add(this.issueModel.UserId, this.issueModel.Title, this.issueModel.Content);
            var model = IssueModel.FromIssue(newIssue);
            return this.SuccessExecution(model).ToTaskResult();
        }
    }
}