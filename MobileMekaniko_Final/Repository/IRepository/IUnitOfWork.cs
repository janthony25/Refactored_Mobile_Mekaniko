﻿namespace MobileMekaniko_Final.Repository.IRepository
{
    public interface IUnitOfWork
    {
        ICustomerRepository Customer { get; }
    }
}
